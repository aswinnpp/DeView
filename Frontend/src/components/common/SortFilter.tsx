import Button from "./Button";

export interface SortOption {
  value: string;
  label: string;
}

interface SortFilterProps {
  sortByOptions: SortOption[];
  orderOptions: SortOption[];
  sortBy: string;
  sortOrder: string;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onReset?: () => void;
  showReset?: boolean;
  sortByLabel?: string;
  orderLabel?: string;
  resetLabel?: string;
  className?: string;
}

const defaultSelectClass =
  "w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-2 py-2 text-xs text-slate-100 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70";

const SortFilter = ({
  sortByOptions,
  orderOptions,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onReset,
  showReset = false,
  sortByLabel = "Sort by",
  orderLabel = "Order",
  resetLabel = "Reset",
  className = "",
}: SortFilterProps) => {
  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`.trim()}>
      <div className="w-32">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {sortByLabel}
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className={defaultSelectClass}
        >
          {sortByOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-32">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {orderLabel}
        </label>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className={defaultSelectClass}
        >
          {orderOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showReset && onReset && (
        <Button variant="ghost" onClick={onReset} className="h-[38px] self-end">
          {resetLabel}
        </Button>
      )}
    </div>
  );
};

export default SortFilter;
