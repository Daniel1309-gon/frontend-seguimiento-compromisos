"use client";

import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { auditoriaService } from "@/app/services/auditoriaServices";
import { X, Loader2, Save, Calendar } from "lucide-react";
import { useAuditores } from "@/app/hooks/useAuditores";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DEPARTAMENTOS = [
  "Análisis de Entidades Financieras y Simulacros",
  "Comunicaciones y Relaciones Corporativas",
  "Desarrollo Administrativo",
  "Estrategia y Transformación",
  "Gestión de Contenidos",
  "Gestión de Inversiones",
  "Gestión de Otros Activos",
  "Información Financiera",
  "Jurídico",
  "Operaciones de Tesorería",
  "Riesgo Operativo y Procesos",
  "Riesgos Financieros de la Reserva",
  "Relacionamiento Ciudadano",
  "Resolución y Liquidaciones",
  "Sistema de Seguro de Depósitos",
  "Talento Humano",
  "Tecnologías de la Información",
];

export default function CreateAuditoriaModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const { accounts } = useMsal();
  const [loading, setLoading] = useState<boolean>(false);
  const [iscreating, setIsCreating] = useState<boolean>(false);
  const {auditores, loading: loadingAuditores} = useAuditores();

  const [formData, setFormData] = useState({
    topic: "",
    area: "",
    radicate_onbase: "",
    user_aud: "",
    date_onbase: new Date().toISOString().split('T')[0],
  });

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic || !formData.area || !formData.radicate_onbase || !formData.user_aud) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      setIsCreating(true);

      await auditoriaService.createAuditoria({
        ...formData,
      });
      
      setFormData({
        topic: "",
        area: "",
        radicate_onbase: "",
        user_aud: "",
        date_onbase: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creando auditoria:", error);
      alert(
        "Hubo un error al crear la auditoria. Por favor, intenta de nuevo."
      );
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Contenedor del Modal */}
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        {/* Botón X para cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        >
          <X size={24} />
        </button>

        {/* Título */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-500">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-300">Nuevo informe</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Ingresa los datos iniciales del informe.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campo: Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Tema / Título
            </label>
            <input
              type="text"
              autoFocus
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-200 text-gray-700 dark:placeholder-gray-500 dark:text-white dark:bg-gray-800 text-sm"
              placeholder="Ej. Auditoría ISO 9001 - 2024"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Fecha de radicado (OnBase)
            </label>
            <div className="relative">
                <input
                type="date"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 outline-none transition dark:bg-gray-800 dark:text-white text-sm"
                value={formData.date_onbase}
                onChange={(e) =>
                    setFormData({ ...formData, date_onbase: e.target.value })
                }
                />
                <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Campo: Área */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400  mb-1 block">
              Departamento
            </label>
            <select
              className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.area}
              onChange={(e) =>
                setFormData({ ...formData, area: e.target.value })
              }
            >
              <option value="" disabled>
                Seleccione un departamento
              </option>
              {DEPARTAMENTOS.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              Auditor encargado
            </label>
            <select
              className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.user_aud}
              onChange={(e) =>
                setFormData({ ...formData, user_aud: e.target.value })
              }
              disabled={loadingAuditores}
            >
              <option value="">Asignar a...</option>
              {auditores.map((aud) => (
                <option key={aud.aud_user} value={aud.aud_user}>
                  {aud.aud_user}
                </option>
              ))}
            </select>
          </div>

          {/* Campo: Radicado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
              Radicado OnBase
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder-gray-200 dark:placeholder-gray-500 text-gray-700 dark:text-gray-300 dark:bg-gray-800 text-sm"
              placeholder="Ej. XXXX-I-XXXXXX"
              value={formData.radicate_onbase}
              onChange={(e) =>
                setFormData({ ...formData, radicate_onbase: e.target.value })
              }
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 mt-8 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={iscreating}
              className="px-4 py-2 cursor-pointer text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {iscreating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              {iscreating ? "Guardando..." : "Registrar informe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
