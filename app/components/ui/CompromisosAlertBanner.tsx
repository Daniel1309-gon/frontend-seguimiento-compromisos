"use client";

import { X } from "lucide-react";
import { CompromisoEnProceso } from "@/app/services/auditoriaServices";

interface CompromisosAlertBannerProps {
  compromisos: CompromisoEnProceso[];
  onClose: () => void;
  onViewAll: () => void;
}

export default function CompromisosAlertBanner({
  compromisos,
  onClose,
  onViewAll,
}: CompromisosAlertBannerProps) {
  const count = compromisos.length;
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {count === 1
              ? "Hay 1 compromiso que vence en 7 dias habiles."
              : `Hay ${count} compromisos que vencen en 7 dias habiles.`}
          </p>
          <p className="text-xs text-amber-800/80 dark:text-amber-100/80">
            Revisa los compromisos en proceso para priorizar acciones.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700  w-full sm:w-auto cursor-pointer"
          >
            Ver compromisos
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-amber-200 bg-white px-2 py-2 text-xs text-amber-700 transition hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-100 w-full sm:w-auto flex items-center justify-center dark:hover:bg-amber-800 cursor-pointer"
            aria-label="Cerrar banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
