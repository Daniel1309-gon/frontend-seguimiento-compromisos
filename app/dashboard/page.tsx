"use client";
import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import { auditoriaService, Auditoria } from "../services/auditoriaServices";
import { Loader2, FileText, LogIn, Calendar, Building } from "lucide-react";
import CreateAuditoriaModal from "../components/auditoria/CreateAuditoriaModal";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ui/ThemeToggle";
import DeleteButton from "../components/ui/DeleteButton";
import { UserNav } from "../components/ui/UserNav";
import LoginPage from "../components/ui/LoginPage";

export default function Dashboard() {
  const router = useRouter();

  // Estados solo para lectura
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  /*   const [departamentos, setDepartamentos] = useState<string[]>(DEPARTAMENTOS); */

  // --- 1. Lógica de Autenticación ---
  const { accounts } = useMsal();


  // --- 2. Lógica de Carga de Datos ---
  const cargarAuditorias = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await auditoriaService.getAuditorias();
      setAuditorias(data);
    } catch (err) {
      console.error(err);
      setError(
        "No se pudieron cargar los datos. Verifica que el Backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Efecto Principal ---
  useEffect(() => {
    // Si hay un usuario detectado por MSAL
    if (accounts.length > 0) {
      cargarAuditorias();
    } else {
      // Si no hay usuario, apagamos el loading para mostrar la pantalla de login
      setLoading(false);
    }
  }, [accounts]);

  // --- 4. RENDERIZADO CONDICIONAL ---

  // CASO A: Usuario NO Logueado -> Mostrar Pantalla de Login
  if (accounts.length === 0) {
    return <LoginPage />;
  }

  // CASO B: Usuario Logueado pero Cargando datos -> Spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2"
            size={40}
          />
          <p className="text-gray-500">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  // CASO C: Usuario Logueado y Datos Listos -> Dashboard
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado Superior */}
        {<UserNav />}

        {/* Mensajes de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Lista de Auditorías */}
        {auditorias.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700 transition-colors duration-300">
            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              No tienes auditorías asignadas
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Cuando se creen registros, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditorias.map((aud) => (
              <div
                key={aud.id_aud}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer relative group"
              >
                <div onClick={() => router.push(`dashboard/${aud.id_aud}`)}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
                      {aud.topic}
                    </h3>

                    <div className="absolute top-4 right-4 ">
                      <DeleteButton
                        compact
                        onDelete={async () => {
                          await auditoriaService.deleteAuditoria(aud.id_aud);
                          cargarAuditorias();
                        }}
                        itemName="este informe de auditoría"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Building
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>{aud.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar
                        size={16}
                        className="text-gray-400 dark:text-gray-500"
                      />
                      <span>Fecha: {aud.date_onbase}</span>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded whitespace-nowrap ml-2 absolute right-4">
                        {aud.radicate_onbase}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <CreateAuditoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={cargarAuditorias}
      />
    </div>
  );
}
