"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auditoriaService, Auditoria } from "@/app/services/auditoriaServices";
import {
  Loader2,
  ArrowLeft,
  Building,
  Calendar,
  FileWarning,
  Plus,
} from "lucide-react";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import OpMejoraItem from "@/app/components/auditoria/OpMejoraItem";

export const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return "Sin fecha"; // Maneja nulos

  const fechaStr = dateString.toString().split('T')[0];
  const [year, month, day] = fechaStr.split('-');
  return `${day}/${month}/${year}`;
};
//next pasa los parametros de la url en el props

export default function AuditoriaDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [auditoria, setAuditoria] = useState<Auditoria | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = use(params);
  const [newMejora, setNewMejora] = useState<string>("");
  const [addingMejora, setAddingMejora] = useState<boolean>(false);

  const cargarDetalle = useCallback(async () => {
    try {
      const idNum = parseInt(id);
      const data = await auditoriaService.getAuditoriaById(idNum);
      setAuditoria(data);
    } catch (err) {
      console.error("Error cargando auditoria: ", err);
      alert("No se encontró la auditoría o no tiene permisos para verla.");
      //push redirige a otra pagina
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      cargarDetalle();
    }
  }, [cargarDetalle, id]);

  const handleAddMejora = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMejora.trim() || !auditoria) return;

    try {
      setAddingMejora(true);
      const idNum = parseInt(id);
      await auditoriaService.createOpMejora(idNum, newMejora.trim());

      setNewMejora("");
      await cargarDetalle();
    } catch {
      console.error("Error agregando mejora");
    } finally {
      setAddingMejora(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin mr-2" size={40} />
        Cargando...
      </div>
    );
  }

  if (!auditoria) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-6 transition cursor-pointer"
          >
            <ArrowLeft size={20} />
            Volver al Dashboard
          </button>

          <ThemeToggle />
        </div>
        <div className="bg-white  dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {auditoria.topic}
              </h1>
              <div className="flex gap-4 text-gray-600 dark:text-gray-300 text-sm">
                <span className="flex items-center gap-1">
                  <Building size={16} />
                  Área: {auditoria.area}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Fecha en OnBase:{" "}
                  {formatDate(auditoria.date_onbase)}
                </span>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg font-mono font-medium">
              Radicado OnBase:{" "}
              <span className="font-mono">{auditoria.radicate_onbase}</span>
            </div>
          </div>
        </div>

        <div className=" mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
            <FileWarning className="text-orange-500" />
            Hallazgos / Oportunidades
          </h2>
          <form
            onSubmit={handleAddMejora}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex gap-3"
          >
            <textarea
              rows={2}
              value={newMejora}
              onChange={(e) => setNewMejora(e.target.value)}
              placeholder="Descripción del hallazgo..."
              className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
              disabled={addingMejora}
            />
            <button
              className="bg-gray-900 dark:bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-black dark:hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
              disabled={addingMejora || !newMejora.trim()}
            >
              {addingMejora ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Plus size={16} />
              )}
              Agregar oportunidad de mejora
            </button>
          </form>
        </div>

        {/* Lista de Mejoras */}
        {!auditoria.mejoras || auditoria.mejoras.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border-l-4 border-l-orange-500 border-y border-r border-y-gray-200 border-r-gray-200 dark:border-y-gray-700 dark:border-r-gray-700 text-gray-800 dark:text-gray-200 mb-4">
            <p>
              No se han registrado oportunidades de mejora en esta auditoría.
            </p>
            <p className="text-sm mt-1">
              Usa el botón <strong>&quot;Agregar oportunidad de mejora&quot;</strong> para comenzar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {auditoria.mejoras.map((mejora) => (
              // Reemplazamos todo el div anterior por nuestro componente inteligente
              <OpMejoraItem 
                key={mejora.id_op} 
                hallazgo={mejora} 
                onUpdate={cargarDetalle}
                onDeleteMejora={async () => {
                  await auditoriaService.deleteOpMejora(mejora.id_op);
                  cargarDetalle();
                }} // Pasamos la función para refrescar la pantalla
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
