"use client";
import { Loader2 } from "lucide-react";
import { CompromisoEnProceso } from "@/app/services/auditoriaServices";
import ToggleCompromisoStatusButton from "./ToggleCompromisoStatusButton";

interface UpcomingCompromisosSectionProps {
  compromisos: CompromisoEnProceso[];
  loading: boolean;
  error: string;
  updatingCompromisoId: number | null;
  onViewAll: () => void;
  onToggleStatus: (compromiso: CompromisoEnProceso) => void;
  formatDate: (dateString: string | Date | undefined) => string;
}

export default function UpcomingCompromisosSection({
  compromisos,
  loading,
  error,
  updatingCompromisoId,
  onViewAll,
  onToggleStatus,
  formatDate,
}: UpcomingCompromisosSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Compromisos por vencer (30 dias)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Compromisos en proceso con fecha limite en los próximos 30 días.
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900 cursor-pointer"
        >
          Ver todos los compromisos
        </button>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-6 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} />
            Cargando compromisos...
          </div>
        ) : compromisos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
            No hay compromisos por vencer en los proximos 30 dias.
          </div>
        ) : (
          <div className="space-y-4">
            {compromisos.map((compromiso) => (
              <div
                key={compromiso.id_com}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <span>Compromiso</span>
                      <span className="text-gray-300">•</span>
                      <span>{compromiso.area}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {compromiso.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Op. mejora: {compromiso.op_description}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Auditoria: {compromiso.topic}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Radicado OnBase: {compromiso.radicate_onbase}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Fecha limite: {formatDate(compromiso.deadline)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
                        compromiso.estado === "Completado"
                          ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
                      }`}
                    >
                      {compromiso.estado}
                    </span>
                    <ToggleCompromisoStatusButton
                      isUpdating={updatingCompromisoId === compromiso.id_com}
                      onClick={() => onToggleStatus(compromiso)}
                      label={
                        compromiso.estado === "Completado" ? "Reabrir" : "Finalizar"
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
