import React from "react";

export interface CounterProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  /** Employer / addressee */
  companyName: string;
  jobTitle: string;
  salary?: string;
  location?: string;
  startDate?: string;
  benefits?: string;
  letterContent: string;
  onLetterContentChange: (value: string) => void;
  jobTitleChange: (value: string) => void;
  salaryChange: (value: string) => void;
  locationChange: (value: string) => void;
  startDateChange: (value: string) => void;
  benefitsChange: (value: string) => void;
  error?: string | null;
  isLoading?: boolean;
}

/**
 * Same visual template as {@link OfferLetterModal}: gradient letterhead, white body,
 * “letter content” area, details box, signature, footer actions.
 */
const CounterProposalModal: React.FC<CounterProposalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  companyName,
  jobTitle,
  salary,
  location,
  startDate,
  benefits,
  letterContent,
  onLetterContentChange,
  jobTitleChange,
  salaryChange,
  locationChange,
  startDateChange,
  benefitsChange,
  error,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const normalizeOptional = (v: string | undefined) => (v ?? "").trim();

  const localValidationError = (() => {
    // Only validate position title when user provides a value.
    const pos = normalizeOptional(jobTitle);
    if (pos.length > 0 && pos.length < 2) return "Position title must be at least 2 characters.";

    const s = normalizeOptional(salary);
    if (s.length > 0 && !/\d/.test(s)) return "Salary must contain at least one digit.";

    const l = normalizeOptional(location);
    if (l.length > 0 && l.length < 2) return "Location must be at least 2 characters.";

    const sd = normalizeOptional(startDate);
    if (sd.length > 0) {
      const iso = /^\d{4}-\d{2}-\d{2}$/;
      const parsed = new Date(sd);
      if (!iso.test(sd) && Number.isNaN(parsed.getTime())) return "Start date must be a valid date.";
    }

    const b = normalizeOptional(benefits);
    if (b.length > 0 && b.length < 3) return "Benefits must be at least 3 characters.";

    const hasAnyTerms =
      pos.length > 0 || s.length > 0 || l.length > 0 || sd.length > 0 || b.length > 0;
    if (!letterContent.trim() && !hasAnyTerms) return "Letter content is required.";

    return null;
  })();

  return (
    <div
      className="fixed inset-0 bg-black/85 flex items-center justify-center z-[1000] p-5 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-[800px] w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — same structure as OfferLetterModal (company context) */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 py-10 px-[50px] text-white shrink-0">
          <h1 className="m-0 text-[32px] font-bold tracking-tight">{companyName || "Company"}</h1>
          <p className="mt-2 text-sm opacity-90">Re: Offer of Employment · {jobTitle}</p>
        </div>

        <div className="p-[50px] bg-white text-gray-800 overflow-y-auto flex-1">
          <div className="mb-8">
            <p className="m-0 text-sm text-gray-500">
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="mb-8">
            <p className="m-0 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">To</p>
            <p className="m-0 text-base font-semibold text-gray-900">Hiring Team</p>
            <p className="mt-1 text-sm text-gray-500">{companyName}</p>
          </div>

          <h2 className="m-0 mb-5 text-2xl font-bold text-gray-900 border-b-4 border-indigo-500 pb-2.5">
            Counter proposal
          </h2>

          <div className="mb-5">
            <p className="m-0 text-[15px] text-gray-700 font-semibold">
              Dear Hiring Manager{companyName ? ` at ${companyName}` : ""},
            </p>
          </div>

          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 mb-5">
            <h3 className="m-0 mb-5 text-lg text-gray-900">Regarding this offer</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Position</label>
                  <input
                    value={jobTitle}
                    onChange={(e) => jobTitleChange(e.target.value)}
                    className="w-full py-2.5 px-3 bg-gray-200 rounded-md text-gray-800 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Position title"
                  />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Company</label>
                <div className="py-2.5 px-3 bg-gray-200 rounded-md text-gray-700 text-sm">{companyName}</div>
              </div>
            </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Offered compensation</label>
                  <input
                    value={salary ?? ""}
                    onChange={(e) => salaryChange(e.target.value)}
                    className="w-full py-2.5 px-3 bg-gray-200 rounded-md text-gray-800 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. 100000 or $100,000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Offered location</label>
                  <input
                    value={location ?? ""}
                    onChange={(e) => locationChange(e.target.value)}
                    className="w-full py-2.5 px-3 bg-gray-200 rounded-md text-gray-800 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="e.g. Remote / City, Country"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Start date (offer)</label>
                  <input
                    value={startDate ?? ""}
                    onChange={(e) => startDateChange(e.target.value)}
                    className="w-full py-2.5 px-3 bg-gray-200 rounded-md text-gray-800 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1.5 font-semibold">Benefits (offer)</label>
                  <textarea
                    value={benefits ?? ""}
                    onChange={(e) => benefitsChange(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-gray-200 rounded-md text-gray-800 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y"
                    placeholder="List benefits (one per line, or separated by commas)."
                  />
                </div>
              </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">
              Letter content (editable)
            </label>
            <textarea
              value={letterContent}
              onChange={(e) => onLetterContentChange(e.target.value)}
              rows={10}
              placeholder="State your counter terms, questions, or conditions…"
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 text-[15px] leading-relaxed font-sans resize-y"
            />
          </div>

          {localValidationError ? <p className="mb-4 text-sm text-red-600 m-0">{localValidationError}</p> : null}
          {error ? <p className="mb-4 text-sm text-red-600 m-0">{error}</p> : null}

          <div className="mt-10">
            <p className="m-0 font-semibold text-gray-900">Sincerely,</p>
            <p className="mt-4 font-semibold text-gray-900">Candidate</p>
          </div>
        </div>

        <div className="py-6 px-[50px] bg-gray-50 border-t border-gray-200 flex gap-3 justify-end shrink-0">
          <button
            type="button"
            className="py-3 px-6 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`py-3 px-6 text-sm rounded-lg border-0 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold shadow-md ${
              isLoading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
            }`}
            onClick={() => void onConfirm()}
            disabled={isLoading || Boolean(localValidationError)}
          >
            {isLoading ? "Sending…" : "Send counter letter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CounterProposalModal;
