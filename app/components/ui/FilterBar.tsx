"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Filter,
  XCircle,
  FileText,
  Loader2,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";
import { Auditoria } from "@/app/services/auditoriaServices";

interface FilterBarProps {
  auditorias: Auditoria[];
  auditores: Array<{ aud_user: string; aud_name: string }>;
  onFilteredChange: (filtered: Auditoria[], currentSortOrder: "asc" | "desc"  ) => void;
  onYearChange?: (year: string) => void;
  handleDownloadReport: () => void;
  isGeneratingReport: boolean;
}

export default function FilterBar({
  auditorias,
  auditores,
  onFilteredChange,
  onYearChange,
  handleDownloadReport,
  isGeneratingReport,
}: FilterBarProps) {
  // Estados internos del FilterBar
  const [filterArea, setFilterArea] = useState<string>("");
  const [filterAuditor, setFilterAuditor] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Calcular departamentos únicos desde las auditorías
  const departamentos = useMemo(() => {
    const depsSet = new Set(auditorias.map((aud) => aud.area));
    return Array.from(depsSet).sort();
  }, [auditorias]);

  // Calcular años disponibles desde las auditorías
  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set(auditorias.map((aud) => new Date(aud.date_onbase).getFullYear())),
    ).sort((a, b) => b - a); // Descendente
    return years;
  }, [auditorias]);

  // Aplicar filtrado y ordenamiento
  const filteredAndSorted = useMemo(() => {
    return auditorias
      .filter((aud) => {
        const matchArea = filterArea ? aud.area === filterArea : true;
        const matchAuditor = filterAuditor
          ? aud.user_aud === filterAuditor
          : true;
        const audYear = new Date(aud.date_onbase).getFullYear().toString();
        const matchYear = filterYear ? audYear === filterYear : true;

        return matchArea && matchAuditor && matchYear;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date_onbase).getTime();
        const dateB = new Date(b.date_onbase).getTime();

        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [auditorias, filterArea, filterAuditor, filterYear, sortOrder]);

  // Notificar cambios al componente padre
  useEffect(() => {
    onFilteredChange(filteredAndSorted, sortOrder);
  }, [filteredAndSorted, sortOrder, onFilteredChange]);

  useEffect(() => {
    if (onYearChange) {
      onYearChange(filterYear);
    }
  }, [filterYear, onYearChange]);

  // Verificar si hay filtros activos
  const hasActiveFilters =
    filterArea ||
    filterAuditor ||
    filterYear !== new Date().getFullYear().toString();

  const clearFilters = () => {
    setFilterArea("");
    setFilterAuditor("");
    setFilterYear(new Date().getFullYear().toString());
    setSortOrder("desc");
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 
        mb-6 ">
      <div className="p-4 ">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* SECCIÓN IZQUIERDA: FILTROS */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Etiqueta "Filtrar" */}
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Filter size={20} />
              </div>

              {/* Contenedor de Selects */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                {/* Select Departamento */}
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full sm:w-auto min-w-[180px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                >
                  <option value="">Todos los departamentos</option>
                  {departamentos.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>

                {/* Select Auditor */}
                <select
                  value={filterAuditor}
                  onChange={(e) => setFilterAuditor(e.target.value)}
                  className="w-full sm:w-auto min-w-[180px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                >
                  <option value="">Todos los auditores</option>
                  {auditores.map((aud) => (
                    <option key={aud.aud_user} value={aud.aud_user}>
                      {aud.aud_name || aud.aud_user}
                    </option>
                  ))}
                </select>

                {/* Select Año */}
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full sm:w-auto min-w-[140px] border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                >
                  <option value="">Todos los años</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                      {year === new Date().getFullYear() && " (Actual)"}
                    </option>
                  ))}
                </select>

                {/* Botón Limpiar */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm text-red-500 hover:text-white dark:text-red-400 hover:bg-red-500 dark:hover:bg-red-600 font-medium transition-colors whitespace-nowrap rounded-lg border border-red-300 dark:border-red-600 hover:border-red-500"
                    title="Limpiar todos los filtros"
                  >
                    <XCircle size={16} />
                    <span className="hidden sm:inline">Limpiar</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN DERECHA: ACCIONES */}
          <div className="flex flex-row gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100 dark:border-gray-700 justify-between lg:justify-end">
            {/* Botón Descargar Reporte */}
            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingReport || filterYear === ""}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer sm:w-auto w-full"
              title="Descargar reporte en formato Excel"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span className="hidden sm:inline">Reporte</span>
                </>
              )}
            </button>

            {/* Botón Sort */}
            <button
              onClick={toggleSort}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm cursor-pointer sm:w-auto w-full"
              title={`Ordenar por fecha: ${sortOrder === "desc" ? "Más recientes primero" : "Más antiguos primero"}`}
            >
              {sortOrder === "desc" ? (
                <>
                  <ArrowDownWideNarrow
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <span className="hidden sm:inline">Más recientes</span>
                </>
              ) : (
                <>
                  <ArrowUpNarrowWide
                    size={18}
                    className="text-orange-600 dark:text-orange-400"
                  />
                  <span className="hidden sm:inline">Más antiguos</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
