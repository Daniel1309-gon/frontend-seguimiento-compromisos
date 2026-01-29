"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Loader2, Send, Trash2, X } from "lucide-react";
import { auditoriaService, Comment } from "@/app/services/auditoriaServices";

interface FollowUpCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  compromisoId: number;
  compromisoTitle?: string;
}

const formatCommentDate = (dateValue: string) => {
  if (!dateValue) return "";
  const parsedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return dateValue;
  return parsedDate.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export default function FollowUpCommentsModal({
  isOpen,
  onClose,
  compromisoId,
  compromisoTitle,
}: FollowUpCommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [observation, setObservation] = useState("");

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await auditoriaService.getCommentsByCompromiso(compromisoId);
      setComments(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los comentarios.");
    } finally {
      setLoading(false);
    }
  }, [compromisoId]);

  useEffect(() => {
    if (!isOpen) {
      setObservation("");
      setError("");
      return;
    }

    loadComments();
  }, [isOpen, loadComments]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedObservation = observation.trim();
    if (!trimmedObservation) return;

    try {
      setSubmitting(true);
      await auditoriaService.createComment({
        id_com: compromisoId,
        observation: trimmedObservation,
      });
      setObservation("");
      await loadComments();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el comentario.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este comentario?"
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      await auditoriaService.deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el comentario.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => {
            onClose();
            setComments([]);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
        >
          <X size={22} />
        </button>

        <div className="p-6 pr-14 border-b border-gray-100 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Seguimiento del compromiso
          </h2>
          {compromisoTitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {compromisoTitle}
            </p>
          )}
        </div>

        <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <Loader2 className="animate-spin mr-2" size={20} />
              Cargando comentarios...
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-4 py-6 text-center text-sm text-gray-500">
              Aun no hay comentarios registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id_seg}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-800 dark:text-gray-100 wrap-break-word">
                        {comment.observation}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">
                          {comment.created_by}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{formatCommentDate(comment.created_at)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id_seg)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar comentario"
                      disabled={submitting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-100 dark:border-gray-600 px-6 py-4"
        >
          <div className="flex flex-col gap-3">
            <textarea
              rows={3}
              placeholder="Escribe un comentario de seguimiento"
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
              disabled={submitting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || observation.trim().length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer w-full sm:w-auto justify-center"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                {submitting ? "Guardando..." : "Agregar comentario"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
