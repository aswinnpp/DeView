import { useCompanyReviewModal } from "../../hooks/admin";
import type { CompanyApproval } from "../../hooks/admin";
import { Button } from "../common";

type CompanyReviewModalProps = {
    company: CompanyApproval;
    onClose: () => void;
    onReject: () => void;
    onApprove?: (id: string) => void;
};

const CompanyReviewModal = ({
    company,
    onClose,
    onApprove,
    onReject,
}: CompanyReviewModalProps) => {
    const {
        documentConfig,
        documentVerification,
        toggleDocVerification,
        getVerifiedCount,
        getUploadedDocsCount,
        areAllDocsVerified,
        getUploadedDoc,
    } = useCompanyReviewModal(company);

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-[8px] flex items-center justify-center z-[1000] p-5">
            <div className="bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border border-[rgba(99,102,241,0.2)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                {/* Modal Header */}
                <div className="flex justify-between items-center py-6 px-8 border-b border-[rgba(99,102,241,0.1)] bg-[rgba(99,102,241,0.05)]">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[14px] bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-2xl font-bold text-white">
                            {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div>
                            <h2 className="m-0 text-[22px] text-[#f1f5f9]">{company.companyName}</h2>
                            <p className="mt-1 mb-0 text-[#94a3b8] text-[13px]">
                                Submitted on {new Date(company.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="text-xl py-2 px-3 rounded-lg"
                    >
                        ✕
                    </Button>
                </div>

                <div className="p-8">
                    {/* Company Details Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8 max-[1200px]:grid-cols-2 max-md:grid-cols-1">
                        {[
                            { label: 'Contact Person', value: company.contactPerson },
                            { label: 'Email', value: company.contactEmail },
                            { label: 'Phone', value: company.contactPhone },
                            { label: 'Tax ID / GST', value: company.taxId },
                            { label: 'Employees', value: company.numberOfEmployees },
                            { label: 'Website', value: company.website || 'Not provided', isLink: !!company.website }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[rgba(15,23,42,0.5)] border border-[rgba(71,85,105,0.3)] rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wide">
                                        {item.label}
                                    </label>
                                </div>
                                {item.isLink ? (
                                    <a
                                        href={company.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#6366f1] text-sm break-all no-underline hover:underline"
                                    >
                                        {item.value}
                                    </a>
                                ) : (
                                    <div className="text-[#e2e8f0] text-sm font-medium">{item.value || '—'}</div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Address */}
                    {company.address && (
                        <div className="bg-[rgba(15,23,42,0.5)] border border-[rgba(71,85,105,0.3)] rounded-xl p-4 mb-8">
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wide">
                                    Registered Address
                                </label>
                            </div>
                            <div className="text-[#e2e8f0] text-sm">{company.address}</div>
                        </div>
                    )}

                    {/* Documents Section */}
                    <div className="bg-[rgba(99,102,241,0.05)] border border-[rgba(99,102,241,0.15)] rounded-2xl p-6">
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center gap-4">
                                <h3 className="m-0 text-lg text-[#f1f5f9] flex items-center gap-2.5">
                                    Verification Documents
                                </h3>
                                <span className={`text-xs font-semibold py-1 px-2.5 rounded-xl ${areAllDocsVerified() ? 'text-[#10b981] bg-[rgba(16,185,129,0.15)]' : 'text-[#f59e0b] bg-[rgba(245,158,11,0.15)]'}`}>
                                    {getVerifiedCount()} / {getUploadedDocsCount()} Verified
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-[1200px]:grid-cols-1">
                            {documentConfig.map((docConfig, index) => {
                                const uploadedDoc = getUploadedDoc(docConfig.key);
                                const isUploaded = !!uploadedDoc;

                                return (
                                    <div
                                        key={docConfig.key}
                                        className={`rounded-xl p-[18px] transition-all duration-200 ${isUploaded ? 'bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.25)]' : 'bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)]'}`}
                                    >
                                        <div className="flex gap-3.5">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold shrink-0 ${isUploaded ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981]' : 'bg-[rgba(239,68,68,0.15)] text-[#f87171]'}`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="m-0 text-sm font-semibold text-[#f1f5f9]">
                                                        {docConfig.label}
                                                    </h4>
                                                    {docConfig.required && (
                                                        <span className="text-[9px] font-bold text-[#f87171] bg-[rgba(248,113,113,0.15)] py-0.5 px-1.5 rounded uppercase">
                                                            Required
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="m-0 mb-3 text-xs text-[#64748b]">
                                                    {docConfig.description}
                                                </p>

                                                {isUploaded && uploadedDoc ? (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2.5">
                                                            <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded ${documentVerification[docConfig.key] ? 'bg-[rgba(16,185,129,0.2)] text-[#10b981]' : 'bg-[rgba(245,158,11,0.2)] text-[#f59e0b]'}`}>
                                                                {documentVerification[docConfig.key] ? 'Verified' : 'Pending Review'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between bg-[rgba(15,23,42,0.5)] rounded-lg py-2.5 px-3 mb-2.5">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <span className="text-[#10b981] text-base">✓</span>
                                                                <span className="text-xs text-[#6ee7b7] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                                    {uploadedDoc.fileName}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="primary"
                                                                onClick={() => window.open(uploadedDoc.fileUrl, '_blank')}
                                                                className="py-1.5 px-3 rounded-md text-[11px] font-semibold"
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant={documentVerification[docConfig.key] ? 'secondary' : 'primary'}
                                                            onClick={() => toggleDocVerification(docConfig.key)}
                                                            className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                                                        >
                                                            {documentVerification[docConfig.key] ? (
                                                                <><span>✓</span> Verified - Click to Unverify</>
                                                            ) : (
                                                                <>Mark as Verified</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 bg-[rgba(239,68,68,0.1)] rounded-lg py-2.5 px-3">
                                                        <span className="text-[#ef4444] text-base">✗</span>
                                                        <span className="text-xs text-[#fca5a5] font-medium">
                                                            Not Uploaded
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-[rgba(71,85,105,0.3)]">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="py-3 px-6 rounded-[10px] font-semibold text-sm"
                        >
                            {onApprove ? 'Cancel' : 'Close'}
                        </Button>
                        <Button
                            variant="danger"
                            onClick={onReject}
                            className="py-3 px-6 rounded-[10px] font-semibold text-sm flex items-center gap-2"
                        >
                            Reject Application
                        </Button>
                        {onApprove && (
                            <Button
                                variant="primary"
                                onClick={() => onApprove(company.id)}
                                className="py-3 px-7 rounded-[10px] font-semibold text-sm flex items-center gap-2"
                            >
                                Approve Company
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyReviewModal;
