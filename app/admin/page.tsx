"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { auditoriaService, SystemLog } from "@/app/services/auditoriaServices";
import {
  ShieldAlert,
  UserPlus,
  History,
  UserCog,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuditores } from "../hooks/useAuditores";
import ThemeToggle from "../components/ui/ThemeToggle";
import DeleteButton from "../components/ui/DeleteButton";
import { InteractionStatus } from "@azure/msal-browser";


export default function AdminPage() {
  const { accounts, inProgress } = useMsal();
  const router = useRouter();
  const { auditores, cargarAuditores: recargarLista } = useAuditores();

  const [activeTab, setActiveTab] = useState<"logs" | "auditores">("auditores");
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Estado para nuevo auditor
  const [newAuditorData, setNewAuditorData] = useState({
    aud_user: "",
    aud_name: "",
  });

  const checkAdmin = useCallback(async () => {
    try {
      const verification = await auditoriaService.checkIsAdmin();
      if (!verification) {
        alert("Acceso denegado. Redirigiendo al dashboard.");
        router.push("/dashboard");
      } else {
        setInitializing(false);
        cargarDatos();
      }
    } catch (error) {
      console.error("Error verificando permisos de administrador", error);
      router.push("/dashboard");
    }
  }, [router]);
  // 1. Verificar permisos al entrar
  useEffect(() => {
    if (inProgress === InteractionStatus.None) {
      if (accounts.length > 0) {
        checkAdmin();
      }
    }
  }, [accounts.length, inProgress, checkAdmin]);


  const recargarLogs = async () => {
    try {
      const logsData = await auditoriaService.getSystemLogs();
      setLogs(logsData);
    } catch (error) {
      console.error("Error cargando logs del sistema", error);
    }
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const logsData = await auditoriaService.getSystemLogs();
      setLogs(logsData);
    } catch (error) {
      console.error("Error cargando logs del sistema", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditorData.aud_user || !newAuditorData.aud_name) return;
    try {
      await auditoriaService.createAuditor(newAuditorData);
      setNewAuditorData({ aud_user: "", aud_name: "" });
      await recargarLista(); // Recargar lista
      await recargarLogs(); // Recargar logs
    } catch (e) {
      alert("Error creando auditor. Verifica que no exista ya.");
      console.error(e);
    }
  };

  const handleDeleteAuditor = async (aud_user: string) => {
    try {
      await auditoriaService.deleteAuditor(aud_user);
      await recargarLista();
      await recargarLogs();
    } catch (e) {
      alert("Error eliminando. Puede que tenga auditorías asignadas.");
      console.error(e);
    }
  };

  if (inProgress !== InteractionStatus.None || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={40} />
        <p className="text-gray-500">Verificando permisos...</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2
            className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2"
            size={40}
          />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-red-600" /> Panel de Administración
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

        {/* TABS DE NAVEGACIÓN */}
        <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 transition">
          <button
            onClick={() => setActiveTab("auditores")}
            className={`pb-2 px-4 py-2 font-medium flex items-center gap-2 cursor-pointer ${
              activeTab === "auditores"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-gray-300 "
            }`}
          >
            <UserCog size={18} /> Gestionar Auditores
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-2 px-4 py-2 font-medium flex items-center gap-2 cursor-pointer ${
              activeTab === "logs"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-gray-300 "
            }`}
          >
            <History size={18} /> Logs del Sistema
          </button>
        </div>

        {/* CONTENIDO: GESTIÓN AUDITORES */}
        {activeTab === "auditores" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formulario Crear */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-fit">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-green-600" /> Nuevo auditor
              </h3>
              <form onSubmit={handleCreateAuditor} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Usuario (ID)
                  </label>
                  <input
                    className="w-full border dark:border-gray-400 p-2 rounded"
                    placeholder="ej. bmontealegre"
                    value={newAuditorData.aud_user}
                    onChange={(e) =>
                      setNewAuditorData({
                        ...newAuditorData,
                        aud_user: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nombre completo
                  </label>
                  <input
                    className="w-full border p-2 rounded dark:border-gray-400"
                    placeholder="ej. Brayan Montealegre"
                    value={newAuditorData.aud_name}
                    onChange={(e) =>
                      setNewAuditorData({
                        ...newAuditorData,
                        aud_name: e.target.value,
                      })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 cursor-pointer"
                >
                  Registrar funcionario
                </button>
              </form>
            </div>

            {/* Lista Auditores */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-4">Funcionarios Activos</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm text-left">
                  <thead className="bg-gray-100 dark:bg-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Usuario</th>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditores.map((aud) => (
                      <tr
                        key={aud.aud_user}
                        className="border-b border-gray-400 dark:border-gray-700"
                      >
                        <td className="px-4 py-3 font-medium">
                          {aud.aud_user}
                        </td>
                        <td className="px-4 py-3">{aud.aud_name}</td>
                        <td className="px-4 py-3 text-right">
                          {/* <button
                            onClick={() => handleDeleteAuditor(aud.aud_user)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-800 cursor-pointer"
                            title="Eliminar Auditor"
                          >
                            <Trash2 size={18} />
                          </button> */}
                          <div className="inline-block">
                            <DeleteButton
                              onDelete={() => handleDeleteAuditor(aud.aud_user)}
                              itemName="este auditor"
                              compact
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO: LOGS */}
        {activeTab === "logs" && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-xs text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Fecha/Hora</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Tabla</th>
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">ID Reg.</th>
                    <th className="px-4 py-3">Detalle Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(log.changed_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 font-mono text-blue-600">
                        {log.app_user}
                      </td>
                      <td className="px-4 py-2 font-mono text-blue-600">
                        {log.table_name}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-white font-bold text-[10px] 
                                            ${
                                              log.action === "INSERT"
                                                ? "bg-green-500"
                                                : log.action === "DELETE"
                                                  ? "bg-red-500"
                                                  : "bg-yellow-500"
                                            }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">{log.record_id}</td>
                      <td
                        className="px-4 py-2 max-w-[180px] sm:max-w-xs truncate"
                        title={log.new_data || log.old_data}
                      >
                        {log.new_data || log.old_data}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
