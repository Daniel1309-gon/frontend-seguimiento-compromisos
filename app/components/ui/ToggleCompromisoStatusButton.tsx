"use client";

import { Loader2 } from "lucide-react";

interface ToggleCompromisoStatusButtonProps {
  isUpdating: boolean;
  onClick: () => void;
  label: string;
}

export default function ToggleCompromisoStatusButton({
  isUpdating,
  onClick,
  label,
}: ToggleCompromisoStatusButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isUpdating}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    >
      {isUpdating ? <Loader2 className="animate-spin" size={14} /> : null}
      {label}
    </button>
  );
}
