"use client";
import React, { use, useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import {
  auditoriaService,
  Auditoria,
  StatsData,
} from "../services/auditoriaServices";
import {
  Loader2,
  FileText,
  Calendar,
  Building,
  Filter,
  XCircle,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";
import CreateAuditoriaModal from "../components/auditoria/CreateAuditoriaModal";
import { useRouter } from "next/navigation";
import DeleteButton from "../components/ui/DeleteButton";
import { UserNav } from "../components/ui/UserNav";
import { DEPARTAMENTOS } from "../components/auditoria/CreateAuditoriaModal";
import { useAuditores } from "../hooks/useAuditores";
import { formatDate } from "./[id]/page";
import { PDFReport } from "../components/auditoria/PDFReport";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { InteractionStatus } from "@azure/msal-browser";

export default function Dashboard() {
  const router = useRouter();

  // Estados solo para lectura
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterArea, setFilterArea] = useState<string>("");
  const [filterAuditor, setFilterAuditor] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const { auditores } = useAuditores();

  const { accounts, inProgress } = useMsal();

  useEffect(() => {
    // Si no hay usuario logueado, redirigir al login
    if (inProgress === InteractionStatus.None && accounts.length === 0) {
      router.push("/login");
    }
  }, [inProgress, accounts, router]);

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

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      cargarAuditorias();
    }
  }, [inProgress, accounts]);

  const filteredAndSortedAuditorias = auditorias
    .filter((aud) => {
      const matchArea = filterArea ? aud.area === filterArea : true;
      const matchAuditor = filterAuditor
        ? aud.user_aud === filterAuditor
        : true;
      return matchArea && matchAuditor;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date_onbase).getTime();
      const dateB = new Date(b.date_onbase).getTime();

      if (sortOrder === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

  const clearFilters = () => {
    console.log(filteredAndSortedAuditorias);
    setFilterArea("");
    setFilterAuditor("");
    setSortOrder("desc");
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleDownloadReport = async () => {
    try {
      setIsGeneratingReport(true);

      const statsData = await auditoriaService.getStatsData();

      const blob = await pdf(<PDFReport statsData={statsData} />).toBlob();

      const fileName = `reporte_auditorias_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generando reporte:", error);
      alert("Ocurrió un error al generar el reporte PDF.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- 4. RENDERIZADO CONDICIONAL ---

  // CASO A: Usuario NO Logueado -> Mostrar Pantalla de Login
  if (inProgress !== InteractionStatus.None || accounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={40} />
        <p className="text-gray-500">Verificando sesión...</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado Superior */}
        {<UserNav onOpenModal={() => setIsModalOpen(true)} />}

        {/* Mensajes de Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mr-2">
                <Filter size={20} />
                <span className="font-medium text-sm hidden sm:inline">
                  Filtrar:
                </span>
              </div>

              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full md:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los departamentos</option>
                {DEPARTAMENTOS.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>

              <select
                value={filterAuditor}
                onChange={(e) => setFilterAuditor(e.target.value)}
                className="w-full md:w-auto border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Todos los auditores</option>
                {auditores.map((aud) => (
                  <option key={aud.aud_user} value={aud.aud_user}>
                    {aud.aud_name || aud.aud_user}
                  </option>
                ))}
              </select>

              {(filterArea || filterAuditor) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors whitespace-nowrap"
                >
                  <XCircle size={16} />
                  Limpiar
                </button>
              )}
            </div>

            {/* ORDENAR */}
            <div className="w-full md:w-auto flex flex-col md:flex-row justify-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100 dark:border-gray-700">
              <button
                onClick={handleDownloadReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-wait cursor-pointer"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>Descargar Reporte PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleSort}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Ordenar por fecha de radicado"
              >
                {sortOrder === "desc" ? (
                  <>
                    <ArrowDownWideNarrow
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    <span>Más recientes</span>
                  </>
                ) : (
                  <>
                    <ArrowUpNarrowWide
                      size={18}
                      className="text-orange-600 dark:text-orange-400"
                    />
                    <span>Más antiguos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Auditorías */}
        {filteredAndSortedAuditorias.length === 0 ? (
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
            {filteredAndSortedAuditorias.map((aud) => (
              <div
                key={aud.id_aud}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer relative group hover:animate-pulsing hover:animate-duration-600"
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
                      <span>Fecha: {formatDate(aud.date_onbase)}</span>
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
