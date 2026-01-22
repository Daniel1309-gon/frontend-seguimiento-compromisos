interface FollowUpButtonProps {
  onClick: () => void;
  count?: number;
  disabled?: boolean;
  className?: string;
}

export default function FollowUpButton({
  onClick,
  count,
  disabled = false,
  className = "",
}: FollowUpButtonProps) {
  const countLabel = typeof count === "number" ? ` (${count})` : "";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50 ${className}`}
    >
      <span>Comentarios{countLabel}</span>
    </button>
  );
}
