"use client";
import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../config/authConfig";
import { auditoriaService, Auditoria } from "../services/auditoriaServices";
import {
  Loader2,
  PlusCircle,
  FileText,
  LogIn,
  LogOut,
  Calendar,
  Building,
} from "lucide-react";
import CreateAuditoriaModal from "../components/auditoria/CreateAuditoriaModal";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ui/ThemeToggle";

export default function Dashboard() {
  const { instance, accounts } = useMsal();
  const router = useRouter();

  // Estados solo para lectura
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- 1. Lógica de Autenticación ---
  const handleLogin = () => {
    // Abre el popup de Microsoft
    instance.loginPopup(loginRequest).catch((e) => {
      console.error(e);
      setError("No se pudo iniciar sesión en Microsoft.");
    });
  };

  const handleLogout = () => {
    // Cierra sesión y limpia el almacenamiento
    instance.logoutPopup().catch((e) => console.error(e));
  };

  // --- 2. Lógica de Carga de Datos ---
  const cargarAuditorias = async () => {
    try {
      setLoading(true);
      setError("");
      // Llamamos al Backend (GET /auditorias/)
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <LogIn size={32} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Sistema de Seguimiento de Auditorías.
            <br />
            Inicia sesión para ver tus asignaciones.
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 transition shadow-sm flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            Ingresar con cuenta corporativa
          </button>
          <div className="mt-6 flex justify-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    );
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Mis Auditorías
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Hola,{" "}
              <span className="font-semibold text-blue-900 dark:text-blue-400">
                {accounts[0]?.name}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <PlusCircle size={20} />
              Nueva Auditoría
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg transition text-sm font-medium cursor-pointer"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </button>
          </div>
        </div>

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
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`dashboard/${aud.id_aud}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors">
                    {aud.topic}
                  </h3>
                  <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded whitespace-nowrap ml-2">
                    {aud.radicate_onbase}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>{aud.area}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400 dark:text-gray-500" />
                    <span>Fecha: {aud.date_onbase}</span>
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
