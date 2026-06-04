import React from "react";

export interface SlotCardProps {
  slotIso: string;
  label: string;
  dateLabel: string;
  isSelected: boolean;
  onToggle: () => void;
  stepMinutes?: number;
}

const SlotCard: React.FC<SlotCardProps> = ({
  label,
  dateLabel,
  isSelected,
  onToggle,
}) => {
  return (
    <div
      role="listitem"
      className={`
        flex flex-col justify-center p-2.5 rounded-lg cursor-pointer outline-none
        bg-gradient-to-b from-white/[0.02] to-white/[0.01]
        border transition-all duration-[120ms] ease-out
        focus:shadow-[0_6px_18px_rgba(11,99,214,0.12)] focus:-translate-y-0.5
        ${isSelected
          ? "border-2 border-blue-600/95 bg-blue-600/[0.06] -translate-y-0.5"
          : "border border-white/[0.03] hover:border-white/[0.06]"
        }
      `}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      tabIndex={0}
      aria-pressed={!!isSelected}
    >
      <div className="flex gap-2.5 items-center">
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select slot ${label}`}
          className="w-[18px] h-[18px] shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-extrabold text-white text-[13px]">{label}</span>
          <span className="text-gray-400 text-[11px]">{dateLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default SlotCard;
