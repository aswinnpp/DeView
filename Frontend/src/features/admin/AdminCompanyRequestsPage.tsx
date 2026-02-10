import { useAdminCompanyRequests } from "../../hooks/admin";
import { Button } from "../../components/common";

const AdminCompanyRequestsPage = () => {
    const {
        pendingCompanies,
        filteredCompanies,
        selectedCompany,
        documentVerification,
        documentConfig,
        searchQuery,
        setSearchQuery,
        showRejectModal,
        rejectionReason,
        setRejectionReason,
        selectCompany,
        clearSelectedCompany,
        handleApprove,
        handleRejectClick,
        handleRejectConfirm,
        closeRejectModal,
        toggleDocVerification,
        getDocumentCount,
        getRequiredDocsUploaded,
        getVerifiedCount,
        getUploadedDocsCount,
        areAllDocsVerified,
        getUploadedDoc,
    } = useAdminCompanyRequests();

    return (
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-8">
                <h1 className="m-0 text-[28px] text-[#f1f5f9]">Company Verification Requests</h1>
                <p className="mt-1 mb-0 text-[#94a3b8] text-sm">
                    Review company documents and approve registrations
                </p>
            </header>

            {/* Search Section */}
            <div className="flex justify-end mb-4">
                <div className="w-full max-w-[400px]">
                    <label className="block text-xs text-[#94a3b8] mb-1.5 font-semibold">
                        Search Companies
                    </label>
                    <input
                        type="text"
                        placeholder="Search by company name, email, or contact person..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-[#0f172a] border border-[#334155] rounded-lg text-[#e2e8f0] text-sm box-border focus:outline-none focus:border-[#6366f1] placeholder:text-[#64748b]"
                    />
                </div>
            </div>

            {pendingCompanies.length === 0 ? (
                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl p-15 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold bg-[rgba(16,185,129,0.15)] text-[#10b981]">OK</div>
                    <h3 className="m-0 mb-2 text-[#f1f5f9]">All caught up!</h3>
                    <p className="m-0 text-[#64748b] text-sm">
                        No pending company requests at the moment
                    </p>
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl p-15 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold bg-[rgba(99,102,241,0.15)] text-[#a5b4fc]">0</div>
                    <h3 className="m-0 mb-2 text-[#f1f5f9]">No Results Found</h3>
                    <p className="m-0 text-[#64748b] text-sm">
                        No companies match your search criteria.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl overflow-hidden">
                        <div className="py-4 px-6 border-b border-[#334155] bg-[rgba(255,255,255,0.02)]">
                            <h3 className="m-0 text-base font-semibold text-[#f1f5f9]">Pending Verification ({filteredCompanies.length} of {pendingCompanies.length})</h3>
                        </div>
                        <div className="overflow-x-auto w-full">
                            <table className="w-full border-collapse table-fixed min-w-[800px] max-[1200px]:min-w-[700px]">
                                <thead className="bg-[rgba(15,23,42,0.8)] border-b border-[#334155]">
                                    <tr>
                                        {['Company', 'Contact', 'Documents', 'Status', 'Submitted', 'Actions'].map(h => (
                                            <th key={h} className="py-3.5 px-4 text-left text-xs font-semibold text-[#94a3b8] uppercase tracking-wide whitespace-nowrap border-b border-[#334155]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCompanies.map((company) => {
                                        const docCount = getDocumentCount(company.documents);
                                        const allRequiredUploaded = getRequiredDocsUploaded(company.documents);

                                        return (
                                            <tr key={company.id} className="border-b border-[rgba(51,65,85,0.5)] transition-colors duration-200 hover:bg-[rgba(99,102,241,0.05)] last:border-b-0">
                                                <td className="p-4 align-middle text-[#e2e8f0] text-sm overflow-hidden text-ellipsis">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-[42px] h-[42px] rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-base font-bold text-white shrink-0">
                                                            {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                                                        </div>
                                                        <div>
                                                            <strong className="text-[#f1f5f9] font-semibold">{company.companyName}</strong>
                                                            <div className="text-xs text-[#64748b]">{company.taxId || 'No Tax ID'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-[#e2e8f0] text-sm">
                                                    <div className="text-[13px]">
                                                        <div className="text-[#e2e8f0]">{company.contactPerson || '—'}</div>
                                                        <div className="text-[#64748b] text-xs">{company.contactEmail}</div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-[#e2e8f0] text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-15 h-1.5 bg-[rgba(100,116,139,0.3)] rounded-sm overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-sm ${allRequiredUploaded ? 'bg-linear-to-r from-[#10b981] to-[#34d399]' : 'bg-linear-to-r from-[#f59e0b] to-[#fbbf24]'}`}
                                                                style={{ width: `${(docCount.uploaded / docCount.total) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-semibold ${allRequiredUploaded ? 'text-[#10b981]' : 'text-[#f59e0b]'}`}>
                                                            {docCount.uploaded}/{docCount.total}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle text-[#e2e8f0] text-sm">
                                                    <span className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[20px] text-[11px] font-semibold uppercase ${allRequiredUploaded ? 'bg-[rgba(16,185,129,0.15)] text-[#34d399]' : 'bg-[rgba(245,158,11,0.15)] text-[#fbbf24]'}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        {allRequiredUploaded ? 'Ready' : 'Incomplete'}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-[13px] text-[#94a3b8]">
                                                    {new Date(company.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="p-4 align-middle text-[#e2e8f0] text-sm">
                                                    <Button
                                                        onClick={() => selectCompany(company)}
                                                        className="py-2 px-[18px] bg-linear-to-br from-[#6366f1] to-[#8b5cf6] text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(99,102,241,0.4)]"
                                                    >
                                                        Review
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Company Review Modal */}
            {selectedCompany && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-[8px] flex items-center justify-center z-[1000] p-5">
                    <div className="bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl max-w-[1000px] w-full max-h-[90vh] overflow-y-auto border border-[rgba(99,102,241,0.2)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center py-6 px-8 border-b border-[rgba(99,102,241,0.1)] bg-[rgba(99,102,241,0.05)]">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[14px] bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-2xl font-bold text-white">
                                    {selectedCompany.companyName?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <div>
                                    <h2 className="m-0 text-[22px] text-[#f1f5f9]">{selectedCompany.companyName}</h2>
                                    <p className="mt-1 mb-0 text-[#94a3b8] text-[13px]">
                                        Submitted on {new Date(selectedCompany.createdAt).toLocaleDateString('en-US', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={clearSelectedCompany}
                                className="bg-[rgba(100,116,139,0.2)] border-none text-[#94a3b8] text-xl cursor-pointer py-2 px-3 rounded-lg transition-all duration-200 hover:bg-[rgba(100,116,139,0.3)]"
                            >
                                ✕
                            </Button>
                        </div>

                        <div className="p-8">
                            {/* Company Details Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8 max-[1200px]:grid-cols-2 max-md:grid-cols-1">
                                {[
                                    { label: 'Contact Person', value: selectedCompany.contactPerson },
                                    { label: 'Email', value: selectedCompany.contactEmail },
                                    { label: 'Phone', value: selectedCompany.contactPhone },
                                    { label: 'Tax ID / GST', value: selectedCompany.taxId },
                                    { label: 'Employees', value: selectedCompany.numberOfEmployees },
                                    { label: 'Website', value: selectedCompany.website || 'Not provided', isLink: !!selectedCompany.website }
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-[rgba(15,23,42,0.5)] border border-[rgba(71,85,105,0.3)] rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wide">
                                                {item.label}
                                            </label>
                                        </div>
                                        {item.isLink ? (
                                            <a
                                                href={selectedCompany.website}
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
                            {selectedCompany.address && (
                                <div className="bg-[rgba(15,23,42,0.5)] border border-[rgba(71,85,105,0.3)] rounded-xl p-4 mb-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-[11px] text-[#64748b] font-semibold uppercase tracking-wide">
                                            Registered Address
                                        </label>
                                    </div>
                                    <div className="text-[#e2e8f0] text-sm">{selectedCompany.address}</div>
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
                                                                        onClick={() => window.open(uploadedDoc.fileUrl, '_blank')}
                                                                        className="bg-[rgba(99,102,241,0.2)] border-none text-[#a5b4fc] py-1.5 px-3 rounded-md text-[11px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[rgba(99,102,241,0.3)]"
                                                                    >
                                                                        View
                                                                    </Button>
                                                                </div>
                                                                <Button
                                                                    onClick={() => toggleDocVerification(docConfig.key)}
                                                                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 ${documentVerification[docConfig.key]
                                                                        ? 'bg-[rgba(100,116,139,0.2)] border border-[rgba(100,116,139,0.3)] text-[#94a3b8]'
                                                                        : 'bg-linear-to-br from-[#10b981] to-[#059669] border-none text-white'
                                                                        }`}
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
                                    onClick={clearSelectedCompany}
                                    className="py-3 px-6 bg-[rgba(100,116,139,0.2)] text-[#94a3b8] border border-[rgba(100,116,139,0.3)] rounded-[10px] font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-[rgba(100,116,139,0.3)]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRejectClick}
                                    className="py-3 px-6 bg-linear-to-br from-[#dc2626] to-[#b91c1c] text-white border-none rounded-[10px] font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(220,38,38,0.4)]"
                                >
                                    Reject Application
                                </Button>
                                <Button
                                    onClick={() => handleApprove(selectedCompany.id)}
                                    className="py-3 px-7 bg-linear-to-br from-[#10b981] to-[#059669] text-white border-none rounded-[10px] font-semibold text-sm cursor-pointer flex items-center gap-2 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(16,185,129,0.4)]"
                                >
                                    Approve Company
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.85)] backdrop-blur-[8px] flex items-center justify-center z-[1100] p-5">
                    <div className="bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl p-8 max-w-[500px] w-full border border-[rgba(239,68,68,0.2)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center text-base font-bold text-[#f87171]">
                                !
                            </div>
                            <div>
                                <h3 className="m-0 text-xl text-[#f1f5f9]">Reject Application</h3>
                                <p className="mt-1 mb-0 text-[#94a3b8] text-[13px]">
                                    {selectedCompany?.companyName}
                                </p>
                            </div>
                        </div>

                        <p className="m-0 mb-4 text-[#94a3b8] text-sm leading-relaxed">
                            Please provide a detailed reason for rejection. This will be sent to the company for their reference.
                        </p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g., Documents are unclear, Tax ID doesn't match company name, Missing required documents..."
                            rows={4}
                            className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(71,85,105,0.5)] rounded-[10px] p-3.5 text-[#e2e8f0] text-sm box-border font-[inherit] resize-y mb-6 focus:outline-none focus:border-[#6366f1]"
                        />

                        <div className="flex gap-3 justify-end">
                            <Button
                                onClick={closeRejectModal}
                                className="py-3 px-6 bg-[rgba(100,116,139,0.2)] text-[#94a3b8] border border-[rgba(100,116,139,0.3)] rounded-[10px] font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-[rgba(100,116,139,0.3)]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRejectConfirm}
                                disabled={!rejectionReason.trim()}
                                className={`py-3 px-6 text-white border-none rounded-[10px] font-semibold text-sm flex items-center gap-2 transition-all duration-200 ${rejectionReason.trim()
                                    ? 'bg-linear-to-br from-[#dc2626] to-[#b91c1c] cursor-pointer opacity-100'
                                    : 'bg-[rgba(100,116,139,0.3)] cursor-not-allowed opacity-60'
                                    }`}
                            >
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanyRequestsPage;
