interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  inputClassName?: string;
}

const defaultInputClass =
  "w-full rounded-lg border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/70";

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  label,
  className = "",
  inputClassName = "",
}: SearchBarProps) => {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${defaultInputClass} ${inputClassName}`.trim()}
      />
    </div>
  );
};

export default SearchBar;
