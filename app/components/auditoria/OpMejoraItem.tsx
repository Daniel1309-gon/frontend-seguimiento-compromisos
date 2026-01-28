"use client";
import React, { useState } from "react";
import { OpMejora, auditoriaService } from "@/app/services/auditoriaServices";
import { toggleCompromisoStatus } from "@/app/services/compromisoUtils";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Circle,
  X,
  Pencil,
} from "lucide-react";
import DeleteButton from "../ui/DeleteButton";
import ExpandableText from "../ui/ExpandableText";
import FollowUpButton from "../ui/FollowUpButton";
import FollowUpCommentsModal from "./FollowUpCommentsModal";

interface Props {
  hallazgo: OpMejora;
  onUpdate: () => void;
  onDeleteMejora?: () => Promise<void>;
}

export default function OpMejoraItem({
  hallazgo,
  onUpdate,
  onDeleteMejora,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Estados del formulario
  const [action, setAction] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [editAction, setEditAction] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const hasCompromiso = !!hallazgo.compromisos;

  const toggleStatus = async () => {
    if (!hallazgo.compromisos) return;

    try {
      await toggleCompromisoStatus(
        hallazgo.compromisos.id_com,
        hallazgo.compromisos.estado ?? "En proceso",
      );
      onUpdate(); // Recargar para mostrar el nuevo estado
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado del compromiso");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await auditoriaService.createCompromiso(hallazgo.id_op, {
        action,
        deadline: deadline,
      });
      onUpdate(); // Recargar para mostrar la vista de "Solo Lectura"
    } catch (error) {
      alert("Error al guardar compromiso");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    if (hallazgo.compromisos) {
      console.log("Iniciando edición con datos:", hallazgo.compromisos);
      setIsEditing(true);
      setEditAction(hallazgo.compromisos.action || "");
      setEditDeadline(hallazgo.compromisos.deadline || "");
    }
  };

  const handleUpdate = async (_: React.FormEvent) => {
    if (!hallazgo.compromisos) return;

    try {
      setLoading(true);
      await auditoriaService.updateCompromiso(hallazgo.compromisos.id_com, {
        action: editAction,
        deadline: editDeadline,
      });
      onUpdate(); // Recargar para mostrar los cambios
    } catch (error) {
      alert("Error al actualizar compromiso");
      console.error(error);
    } finally {
      setIsEditing(false);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      {/* Cabecera del Hallazgo */}
      <div className="p-6 border-l-4 border-l-orange-500 flex justify-between items-start">
        <div className="flex-1">
          <ExpandableText
            text={hallazgo.description}
            maxLines={4}
            minLength={200}
            className="text-md"
          />
          <div className="mt-3 flex items-center gap-2">
            {/* Badge de Estado */}
            {hasCompromiso ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                <CheckCircle2 size={12} /> Compromiso Definido
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium">
                <AlertCircle size={12} /> Sin Compromiso
              </span>
              
            )}

            {onDeleteMejora && (
              <div className="border-l pl-2 ml-1 border-gray-300 dark:border-gray-600">
                <DeleteButton
                  compact
                  itemName="esta oportunidad de mejora"
                  onDelete={onDeleteMejora}
                />
              </div>
              
            )}
            
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-4 text-blue-600 dark:text-blue-400 p-1 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition cursor-pointer hover:text-black dark:hover:text-white"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Zona Expandible */}
      {expanded && (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2">
          {/* CASO A: YA EXISTE COMPROMISO (Modo Lectura) */}
          {hasCompromiso ? (
            <div
              className={`
            p-4 rounded border transition-all 
            ${
              hallazgo.compromisos?.estado === "Completado"
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
            }
            `}
            >
              {isEditing ? (
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    Editando Compromiso
                  </h4>
                  <div className="flex flex-col md:flex-row gap-2">
                    <textarea
                      rows={2}
                      placeholder="¿Qué se va a hacer?"
                      className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      value={editAction}
                      onChange={(e) => setEditAction(e.target.value)}
                      required
                    />
                    <input
                      type="date"
                      className="md:w-40 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                    >
                      <X size={16} /> Cancelar
                    </button>
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      {loading ? (
                        "..."
                      ) : (
                        <>
                          <Save size={16} /> Guardar Cambios
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* --- SUB-CASO A2: MODO LECTURA --- */
                <div className="flex items-start gap-4">
                  {/* Botón Estado */}
                  <button
                    onClick={toggleStatus}
                    title="Cambiar estado"
                    className={`mt-1 ${
                      hallazgo.compromisos?.estado === "Completado"
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-300 dark:text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    {hallazgo.compromisos?.estado === "Completado" ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Circle size={24} />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Compromiso Actual
                      </h4>

                      {/* Acciones: Editar y Eliminar */}
                      <div className="flex items-center gap-1">
                        <FollowUpButton
                          onClick={() => setIsCommentsOpen(true)}
                          className="mr-2"
                        />   
                          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"/>
                        <button
                          onClick={startEditing}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          title="Editar descripción o fecha"
                        >
                          <Pencil size={16} />
                        </button>
                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"/>

                        <DeleteButton
                          compact
                          itemName="este compromiso"
                          onDelete={async () => {
                            if (hallazgo.compromisos) {
                              await auditoriaService.deleteCompromiso(
                                hallazgo.compromisos.id_com
                              );
                              onUpdate();
                            }
                          }}
                          />
                          
                      </div>
                    </div>

                    <p
                      className={`font-medium mb-2 ${
                        hallazgo.compromisos?.estado === "Completado"
                          ? "text-gray-500 line-through decoration-gray-400"
                          : "text-gray-800 dark:text-white"
                      }`}
                    >
                      {hallazgo.compromisos?.action}
                    </p>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Vence: {hallazgo.compromisos?.deadline}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${
                          hallazgo.compromisos?.estado === "Completado"
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}
                      >
                        {hallazgo.compromisos?.estado}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* CASO B: NO EXISTE COMPROMISO (Modo Creación) */
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Definir Compromiso
              </h4>
              <div className="flex flex-col md:flex-row gap-2">
                <textarea
                  rows={2}
                  placeholder="¿Qué se va a hacer?"
                  className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="md:w-40 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                >
                  {loading ? (
                    "..."
                  ) : (
                    <>
                      <Save size={16} /> Guardar
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      {/* Modal de Seguimiento */}
      {hallazgo.compromisos && (
        <FollowUpCommentsModal
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
          compromisoId={hallazgo.compromisos.id_com}
          compromisoTitle={hallazgo.compromisos.action}
        />
      )}
    </div>
  );
}
