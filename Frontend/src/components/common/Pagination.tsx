import type { ReactNode } from "react";

interface IPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Optional left slot (e.g. "Showing 1–10 of 50") */
  leftContent?: ReactNode;
}

const buttonClass =
  "rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700";

function Pagination({
  page,
  totalPages,
  onPageChange,
  leftContent,
}: IPaginationProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-4 max-md:flex-col max-md:items-stretch">
      <div className="text-sm text-slate-400 max-md:order-2 max-md:text-center">
        {leftContent}
      </div>
      <div className="flex items-center justify-center gap-2 max-md:order-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={buttonClass}
        >
          Previous
        </button>
        <span className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={buttonClass}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
