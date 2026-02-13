import { useNavigate } from "react-router-dom";
import { useDocumentView } from "../../hooks/admin";
import { Button } from "../../components/common";

const AdminDocumentViewPage = () => {
    const navigate = useNavigate();
    const {
        company,
        document,
        documentInfo,
        isVerified,
        isUpdating,
        toggleVerification,
    } = useDocumentView();

    // Guard: if no data in route state, show fallback
    if (!company || !document || !documentInfo) {
        return (
            <div className="max-w-[1000px] mx-auto">
                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl p-15 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold bg-[rgba(239,68,68,0.15)] text-[#f87171]">
                        !
                    </div>
                    <h3 className="m-0 mb-2 text-[#f1f5f9]">Document Not Found</h3>
                    <p className="m-0 text-[#64748b] text-sm mb-6">
                        The document could not be loaded. Please go back to company requests.
                    </p>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/admin/company-requests")}
                        className="py-2.5 px-6 rounded-lg text-sm font-semibold"
                    >
                        Back to Company Requests
                    </Button>
                </div>
            </div>
        );
    }

    const fileExtension = document.fileName.split('.').pop()?.toLowerCase() ?? "";
    const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension);
    const isPdf = fileExtension === "pdf";

    return (
        <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="py-2 px-3 rounded-lg text-sm"
                    >
                        ← Back
                    </Button>
                    <div>
                        <h1 className="m-0 text-xl text-[#f1f5f9]">{documentInfo.label}</h1>
                        <p className="mt-1 mb-0 text-[#94a3b8] text-[13px]">
                            {company.companyName} • {documentInfo.description}
                        </p>
                    </div>
                </div>

                {/* Verification Badge */}
                <span className={`inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold ${isVerified
                    ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)]'
                    : 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]'
                    }`}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {isVerified ? 'Verified' : 'Pending Review'}
                </span>
            </div>

            {/* Document Info Bar */}
            <div className="bg-linear-to-r from-[rgba(99,102,241,0.08)] to-[rgba(139,92,246,0.08)] border border-[rgba(99,102,241,0.2)] rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-sm font-bold text-[#a5b4fc] uppercase">
                        {fileExtension}
                    </div>
                    <div>
                        <div className="text-[#e2e8f0] text-sm font-medium">{document.fileName}</div>
                        <div className="text-[#64748b] text-xs mt-0.5">
                            Uploaded on {new Date(document.uploadedAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })}
                            {documentInfo.required && (
                                <span className="ml-2 text-[9px] font-bold text-[#f87171] bg-[rgba(248,113,113,0.15)] py-0.5 px-1.5 rounded uppercase">
                                    Required
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    variant="secondary"
                    onClick={() => window.open(document.fileUrl, '_blank')}
                    className="py-2 px-4 rounded-lg text-xs font-semibold"
                >
                    Open in New Tab ↗
                </Button>
            </div>

            {/* Document Preview */}
            <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl overflow-hidden mb-6">
                <div className="py-3.5 px-6 border-b border-[#334155] bg-[rgba(255,255,255,0.02)] flex items-center justify-between">
                    <h3 className="m-0 text-sm font-semibold text-[#f1f5f9]">Document Preview</h3>
                </div>

                <div className="p-6">
                    {isPdf ? (
                        <div className="w-full rounded-xl overflow-hidden border border-[rgba(71,85,105,0.3)]">
                            <iframe
                                src={document.fileUrl}
                                title={document.fileName}
                                className="w-full border-none bg-white"
                                style={{ height: "70vh" }}
                            />
                        </div>
                    ) : isImage ? (
                        <div className="flex items-center justify-center bg-[rgba(15,23,42,0.5)] rounded-xl p-6 border border-[rgba(71,85,105,0.3)]">
                            <img
                                src={document.fileUrl}
                                alt={document.fileName}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 bg-[rgba(15,23,42,0.5)] rounded-xl border border-[rgba(71,85,105,0.3)]">
                            <div className="w-20 h-20 rounded-2xl bg-[rgba(99,102,241,0.15)] flex items-center justify-center text-3xl font-bold text-[#a5b4fc] mb-4 uppercase">
                                {fileExtension}
                            </div>
                            <h4 className="m-0 mb-2 text-[#f1f5f9] text-lg">Preview not available</h4>
                            <p className="m-0 mb-4 text-[#64748b] text-sm">
                                This file type cannot be previewed in the browser.
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => window.open(document.fileUrl, '_blank')}
                                className="py-2.5 px-6 rounded-lg text-sm font-semibold"
                            >
                                Download File
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Actions */}
            <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h3 className="m-0 text-base text-[#f1f5f9] mb-1">Document Verification</h3>
                        <p className="m-0 text-[#64748b] text-sm">
                            {isVerified
                                ? "This document has been verified. You can unverify it if needed."
                                : "Review the document above and mark it as verified when satisfied."
                            }
                        </p>
                    </div>

                    <Button
                        variant={isVerified ? "secondary" : "primary"}
                        onClick={toggleVerification}
                        disabled={isUpdating}
                        className="py-3 px-6 rounded-[10px] font-semibold text-sm flex items-center gap-2 min-w-[200px] justify-center"
                    >
                        {isUpdating ? (
                            <>Saving...</>
                        ) : isVerified ? (
                            <><span>✓</span> Verified — Click to Unverify</>
                        ) : (
                            <>Mark as Verified</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminDocumentViewPage;
