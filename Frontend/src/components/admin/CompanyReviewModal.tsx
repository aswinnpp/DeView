import { useState, useCallback, useEffect } from "react";
import type { CompanyApproval } from "../../services/adminApproval.service";
import { adminApprovalService } from "../../services/adminApproval.service";
import { Button } from "../common";

type CompanyReviewModalProps = {
  company: CompanyApproval;
  onClose: () => void;
  onReject: () => void;
  onApprove?: (id: string) => void;
  onDocumentMarked?: () => void;
};

const CompanyReviewModal = ({
  company,
  onClose,
  onApprove,
  onReject,
  onDocumentMarked,
}: CompanyReviewModalProps) => {
  const documents = Object.entries(company.documents || {});

  const [docMarks, setDocMarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(documents.map(([k, d]) => [k, d.marked ?? false]))
  );
  const [markingKey, setMarkingKey] = useState<string | null>(null);

  useEffect(() => {
    const entries = Object.entries(company.documents || {});
    setDocMarks(Object.fromEntries(entries.map(([k, d]) => [k, d.marked ?? false])));
  }, [company.documents]);

  const handleMarkDocument = useCallback(
    async (docKey: string, currentMarked: boolean) => {
      setMarkingKey(docKey);
      try {
        await adminApprovalService.markDocument(company.id, docKey, !currentMarked);
        setDocMarks((prev) => ({ ...prev, [docKey]: !currentMarked }));
        onDocumentMarked?.();
      } catch {
      } finally {
        setMarkingKey(null);
      }
    },
    [company.id, onDocumentMarked]
  );

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.85)] backdrop-blur-md flex items-center justify-center z-[1000] p-4 max-md:p-2">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl max-w-[920px] w-full max-h-[90vh] overflow-y-auto border border-slate-600/50 shadow-2xl shadow-black/40 max-md:max-h-[95vh] max-md:rounded-xl">

        {/* Header */}
        <div className="flex justify-between items-center py-6 px-8 max-md:py-4 max-md:px-4 border-b border-slate-600/50 bg-slate-800/50 rounded-t-2xl max-md:rounded-t-xl">
          <div className="flex items-center gap-4 max-md:gap-3 min-w-0 flex-1">
            <div className="w-14 h-14 max-md:w-12 max-md:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl max-md:text-xl font-bold text-white shadow-lg shrink-0">
              {company.companyName?.charAt(0)?.toUpperCase() ?? "C"}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl max-md:text-lg font-semibold text-white m-0 truncate">
                {company.companyName}
              </h2>
              <p className="text-slate-400 text-sm max-md:text-xs mt-0.5 mb-0">
                Submitted {new Date(company.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-lg px-3 py-2 max-md:px-2 max-md:py-1.5 bg-slate-700/80 hover:bg-slate-600 border border-slate-500/50 shrink-0 ml-2"
          >
            ✕
          </Button>
        </div>

        <div className="p-8 max-md:p-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-md:gap-3 mb-8 max-md:mb-6">
            <Info label="Contact" value={company.contactPerson} />
            <Info label="Email" value={company.contactEmail} />
            <Info label="Phone" value={company.contactPhone} />
            <Info label="GST / Tax ID" value={company.taxId} />
            <Info label="Employees" value={company.numberOfEmployees} />
            <Info label="Website" value={company.website || "—"} />
          </div>

          {company.address && (
            <div className="mb-8 max-md:mb-6 p-4 max-md:p-3 rounded-xl bg-slate-800/40 border border-slate-600/30">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Address</p>
              <p className="text-slate-200 text-sm max-md:text-xs m-0 break-words">{company.address}</p>
            </div>
          )}

          {/* Documents */}
          <div className="mb-8 max-md:mb-6 rounded-2xl max-md:rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6 max-md:p-4">
            <h3 className="text-lg max-md:text-base font-semibold text-white mb-4 max-md:mb-3 flex items-center gap-2">
            </h3>
            <div className="grid grid-cols-1 gap-4 max-md:gap-3">
              {documents.map(([docKey, doc]) => {
                const isMarked = docMarks[docKey] ?? doc.marked;
                const isMarking = markingKey === docKey;
                return (
                  <div
                    key={docKey}
                    className={`rounded-xl p-4 flex flex-col gap-3 border transition-colors ${
                      isMarked
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-slate-800/50 border-slate-600/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <span className="text-sm text-slate-200 truncate font-medium">
                        {doc.fileName}
                      </span>
                      {isMarked && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap max-md:flex-col">
                      <Button
                        variant="primary"
                        onClick={() => window.open(doc.fileUrl, "_blank")}
                        className="text-xs px-3 py-1.5 max-md:w-full rounded-lg"
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleMarkDocument(docKey, isMarked)}
                        disabled={isMarking}
                        className={`text-xs px-3 py-1.5 max-md:w-full rounded-lg ${
                          isMarked
                            ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                            : "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30"
                        }`}
                      >
                        {isMarking ? "..." : isMarked ? "Unmark" : "Mark as verified"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-3 max-md:gap-2 pt-6 max-md:pt-4 border-t border-slate-600/50 max-md:flex-col">
            <Button
              variant="secondary"
              onClick={onClose}
              className="rounded-lg px-4 py-2 max-md:w-full bg-slate-700/80 hover:bg-slate-600 border border-slate-500/50"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={onReject}
              className="rounded-lg px-4 py-2 max-md:w-full"
            >
              Reject
            </Button>
            {onApprove && (
              <Button
                variant="primary"
                onClick={() => onApprove(company.id)}
                className="rounded-lg px-4 py-2 max-md:w-full"
              >
                Approve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyReviewModal;

const Info = ({ label, value }: { label: string; value?: string | number }) => (
  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-600/30">
    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">{label}</p>
    <p className="text-slate-200 text-sm font-medium m-0 break-all">{value || "—"}</p>
  </div>
);
