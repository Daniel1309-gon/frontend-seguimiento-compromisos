"use client";
import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import {
  auditoriaService,
  Auditoria,
  CompromisoEnProceso,
} from "../services/auditoriaServices";
import { Loader2, FileText, Calendar, Building } from "lucide-react";
import CreateAuditoriaModal from "../components/auditoria/CreateAuditoriaModal";
import { useRouter } from "next/navigation";
import DeleteButton from "../components/ui/DeleteButton";
import { UserNav } from "../components/ui/UserNav";
import { useAuditores } from "../hooks/useAuditores";
import { formatDate } from "./[id]/page";
import { saveAs } from "file-saver";
import { InteractionStatus } from "@azure/msal-browser";
import FilterBar from "../components/ui/FilterBar";
import UpcomingCompromisosSection from "../components/ui/UpcomingCompromisosSection";
import { toggleCompromisoStatus } from "../services/compromisoUtils";
import CompromisosAlertBanner from "../components/ui/CompromisosAlertBanner";
import {
  setAlertDismissedUntil,
  shouldShowAlert,
  ALERT_TTL_MS,
} from "../services/alertCompromisosCache";

export default function Dashboard() {
  const router = useRouter();

  // Estados solo para lectura
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filteredAuditorias, setFilteredAuditorias] = useState<Auditoria[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString(),
  );
  const [upcomingCompromisos, setUpcomingCompromisos] = useState<
    CompromisoEnProceso[]
  >([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState<boolean>(false);
  const [upcomingError, setUpcomingError] = useState("");
  const [updatingCompromisoId, setUpdatingCompromisoId] = useState<number | null>(null);
  const [alertCompromisos, setAlertCompromisos] = useState<CompromisoEnProceso[]>([]);
  const [showAlertBanner, setShowAlertBanner] = useState(false);

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
        "No se pudieron cargar los datos. Verifica que el Backend esté corriendo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarCompromisosProximos = async () => {
    try {
      setLoadingUpcoming(true);
      setUpcomingError("");
      const data = await auditoriaService.getCompromisosEnProcesoProximos();
      setUpcomingCompromisos(data);
    } catch (err) {
      console.error(err);
      setUpcomingError(
        "No se pudieron cargar los compromisos por vencer. Verifica el backend.",
      );
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const handleToggleCompromisoStatus = async (
    compromiso: CompromisoEnProceso,
  ) => {
    try {
      setUpdatingCompromisoId(compromiso.id_com);
      await toggleCompromisoStatus(compromiso.id_com, compromiso.estado);
      await cargarCompromisosProximos();
    } catch (err) {
      console.error(err);
      setUpcomingError("No se pudo actualizar el estado del compromiso.");
    } finally {
      setUpdatingCompromisoId(null);
    }
  };

  const cargarAlertCompromisos = async () => {
    try {
      const fetched = await auditoriaService.getAlertCompromisos7Dias();
      setAlertCompromisos(fetched);
      setShowAlertBanner(shouldShowAlert(fetched.length > 0));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      cargarAuditorias();
      cargarCompromisosProximos();
      cargarAlertCompromisos();
    }
  }, [inProgress, accounts]);


  
/*   useEffect(() => {
    if (inProgress !== InteractionStatus.None || accounts.length === 0) return;

    const loadAlertCompromisos = async () => {
      try {
        const fetched = await auditoriaService.getAlertCompromisos7Dias();
        setAlertCompromisos(fetched);
        setShowAlertBanner(shouldShowAlert(fetched.length > 0));
      } catch (err) {
        console.error(err);
      }
    };

    loadAlertCompromisos();
  }, [accounts.length, inProgress]); */

  const handleDownloadReport = async () => {
    try {
      if (!selectedYear) {
        alert("Selecciona un año para descargar el reporte.");
        return;
      }
      setIsGeneratingReport(true);
      const year = Number(selectedYear);
      const blob = await auditoriaService.getReporteSeguimiento(year);
      const fileName = `001_CONTROL_Y_SEGUIMIENTO_${selectedYear}.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error generando reporte:", error);
      alert("Ocurrió un error al generar el reporte Excel.");
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
        <FilterBar
          auditorias={auditorias}
          auditores={auditores}
          onFilteredChange={(filtered, order) => {
            setFilteredAuditorias(filtered);
            setSortOrder(order);
          }}
          onYearChange={setSelectedYear}
          handleDownloadReport={handleDownloadReport}
          isGeneratingReport={isGeneratingReport}
        />

        {showAlertBanner && (
          <CompromisosAlertBanner
            compromisos={alertCompromisos}
            onViewAll={() => router.push("/compromisos/en-proceso")}
            onClose={() => {
              setAlertDismissedUntil(Date.now() + ALERT_TTL_MS);
              setShowAlertBanner(false);
            }}
          />
        )}

        <UpcomingCompromisosSection
          compromisos={upcomingCompromisos}
          loading={loadingUpcoming}
          error={upcomingError}
          updatingCompromisoId={updatingCompromisoId}
          onViewAll={() => router.push("/compromisos/en-proceso")}
          onToggleStatus={handleToggleCompromisoStatus}
          formatDate={formatDate}
        />

        {/* Lista de Auditorías */}
        {filteredAuditorias.length === 0 ? (
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
            {filteredAuditorias.map((aud, index) => (
              <div
                key={`${aud.id_aud}-${sortOrder}`}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl dark:hover:shadow-xl  dark:transition-shadow dark:duration-200 duration-200 cursor-pointer relative group  animate-fade-in-up animate-duration-400"
                style={{ animationDelay: `${index * 30}ms` }}
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
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded whitespace-nowrap ml-2 static md:absolute md:right-4">
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
