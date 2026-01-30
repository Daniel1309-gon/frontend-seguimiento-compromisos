"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

interface ActiveTabProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
  icon?: LucideIcon;
}

export const ActiveTab: React.FC<ActiveTabProps> = ({
  isActive,
  onClick,
  label,
  icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pb-2 px-4 py-2 font-medium flex items-center gap-2 cursor-pointer ${
        isActive
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-gray-300 "
      }`}
    >
      {icon ? React.createElement(icon, { size: 18 }) : null}
      {label}
    </button>
  );
};
