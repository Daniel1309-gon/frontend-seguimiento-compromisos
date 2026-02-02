"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, User } from "lucide-react";
import { Auditor } from "@/app/services/auditoriaServices";

interface EditAuditorModalProps {
  isOpen: boolean;
  auditor: Auditor | null;
  onClose: () => void;
  onSave: (aud_user: string, aud_name: string) => Promise<void>;
}

export default function EditAuditorModal({
  isOpen,
  auditor,
  onClose,
  onSave,
}: EditAuditorModalProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (auditor) {
      setName(auditor.aud_name);
      setError("");
    }
  }, [auditor]);

  if (!isOpen || !auditor) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      setError("");
      await onSave(auditor.aud_user, name.trim());
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el nombre del auditor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-2xl w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition cursor-pointer"
        >
          <X size={22} />
        </button>

        <div className="p-6 border-b border-gray-100 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Editar auditor
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Usuario: {auditor.aud_user}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Nombre completo
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-3 py-2">
              <User size={18} className="text-gray-400" />
              <input
                className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-100 outline-none"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nombre del auditor"
                disabled={saving}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition cursor-pointer w-full sm:w-auto"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 cursor-pointer text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : null}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
