"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  auditoriaService,
  CompromisoEnProceso,
} from "@/app/services/auditoriaServices";
import { toggleCompromisoStatus } from "@/app/services/compromisoUtils";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import ToggleCompromisoStatusButton from "@/app/components/ui/ToggleCompromisoStatusButton";
import CompromisosAlertBanner from "@/app/components/ui/CompromisosAlertBanner";
import {
  setAlertDismissedUntil,
  shouldShowAlert,
  ALERT_TTL_MS,
} from "@/app/services/alertCompromisosCache";

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return "Sin fecha";
  const fechaStr = dateString.toString().split("T")[0];
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
};

export default function CompromisosEnProcesoPage() {
  const router = useRouter();
  const { accounts, inProgress } = useMsal();
  const [compromisos, setCompromisos] = useState<CompromisoEnProceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [alertCompromisos, setAlertCompromisos] = useState<CompromisoEnProceso[]>(
    []
  );
  const [showAlertBanner, setShowAlertBanner] = useState(false);

  const cargarCompromisos = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await auditoriaService.getCompromisosEnProceso();
      setCompromisos(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los compromisos en proceso.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length === 0) {
      router.push("/login");
    }
  }, [inProgress, accounts, router]);

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      cargarCompromisos();
    }
  }, [inProgress, accounts]);

  useEffect(() => {
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
  }, [accounts.length, inProgress]);

  const handleToggleStatus = async (compromiso: CompromisoEnProceso) => {
    try {
      setUpdatingId(compromiso.id_com);
      await toggleCompromisoStatus(compromiso.id_com, compromiso.estado);
      await cargarCompromisos();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado del compromiso.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (inProgress !== InteractionStatus.None || accounts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={40} />
        <p className="text-gray-500">Verificando sesión...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2"
            size={40}
          />
          <p className="text-gray-500">Cargando compromisos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Compromisos en proceso
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <ThemeToggle />

            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowLeft /> Volver al Dashboard
            </button>
          </div>
        </div>

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

        <div className="mt-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>      
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Listado completo de compromisos pendientes.
            </p>
          </div>

        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        {compromisos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
            No hay compromisos en proceso en este momento.
          </div>
        ) : (
          <div className="space-y-4">
            {compromisos.map((compromiso) => (
              <div
                key={compromiso.id_com}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      <span>Compromiso</span>
                      <span className="text-gray-300">•</span>
                      <span>{compromiso.area}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {compromiso.action}
                    </h3>
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
                      isUpdating={updatingId === compromiso.id_com}
                      onClick={() => handleToggleStatus(compromiso)}
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
