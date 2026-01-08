"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";

interface Props {
  onDelete: () => Promise<void>;
  itemName?: string;
  compact?: boolean;
}

export default function DeleteButton({
  onDelete,
  itemName = "este elemento",
  compact = false,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar ${itemName}? Esta acción no se puede deshacer.`
    );
    if (confirmed) {
      try {
        setLoading(true);
        await onDelete();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al eliminar. Por favor, intenta de nuevo.");
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        flex items-center gap-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors
        ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${
          compact
            ? "p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            : "px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium"
        }
      `}
      title="Eliminar"
    >
      {loading ? (
        <Loader2 size={compact ? 18 : 16} className="animate-spin" />
      ) : (
        <Trash2 size={compact ? 18 : 16} />
      )}

        {!compact && <span>Eliminar</span>}
    </button>
  );
}
