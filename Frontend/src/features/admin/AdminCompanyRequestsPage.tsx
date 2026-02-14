import { useAdminCompanyRequests } from "../../hooks/admin";
import { Button, SearchInput, Table } from "../../components/common";
import { CompanyReviewModal, RejectCompanyModal } from "../../components/admin";

const AdminCompanyRequestsPage = () => {
    const {
        pendingCompanies,
        isLoading,
        error,
        fetchPendingCompanies,
        searchQuery,
        handleSearch,
        selectedCompany,
        selectCompany,
        clearSelectedCompany,
        showRejectModal,
        openRejectModal,
        closeRejectModal,
        handleApprove,
        handleRejectSuccess,
        getDocumentCount,
        getRequiredDocsUploaded,
    } = useAdminCompanyRequests();

    return (
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-8">
                <h1 className="m-0 text-[28px] text-[#f1f5f9]">Company Verification Requests</h1>
                <p className="mt-1 mb-0 text-[#94a3b8] text-sm">
                    Review company documents and approve registrations
                </p>
            </header>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] rounded-xl flex justify-between items-center">
                    <p className="m-0 text-[#f87171] text-sm">{error}</p>
                    <Button variant="secondary" onClick={() => fetchPendingCompanies()} className="py-1.5 px-4 text-xs">
                        Retry
                    </Button>
                </div>
            )}

            {/* Search Section */}
            <div className="flex justify-end mb-4">
                <div className="w-full max-w-[400px]">
                    <label className="block text-xs text-[#94a3b8] mb-1.5 font-semibold">Search Companies</label>
                    <SearchInput
                        placeholder="Search by company name, email, or contact person..."
                        onSearch={handleSearch}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl p-15 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold bg-[rgba(99,102,241,0.15)] text-[#6366f1] animate-pulse">
                        …
                    </div>
                    <h3 className="m-0 mb-2 text-[#f1f5f9]">Loading...</h3>
                    <p className="m-0 text-[#64748b] text-sm">
                        Fetching pending company requests
                    </p>
                </div>
            ) : pendingCompanies.length === 0 ? (
                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl p-15 text-center">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold bg-[rgba(16,185,129,0.15)] text-[#10b981]">OK</div>
                    <h3 className="m-0 mb-2 text-[#f1f5f9]">{searchQuery ? 'No Results Found' : 'All caught up!'}</h3>
                    <p className="m-0 text-[#64748b] text-sm">
                        {searchQuery ? 'No companies match your search criteria.' : 'No pending company requests at the moment'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    <Table
                        columns={[
                            {
                                header: "Company",
                                render: (company) => (
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-[42px] h-[42px] rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-base font-bold text-white shrink-0">
                                            {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                                        </div>
                                        <div>
                                            <strong className="text-[#f1f5f9] font-semibold">{company.companyName}</strong>
                                            <div className="text-xs text-[#64748b]">{company.taxId || 'No Tax ID'}</div>
                                        </div>
                                    </div>
                                ),
                                cellClassName: "text-[#e2e8f0] text-sm overflow-hidden text-ellipsis",
                            },
                            {
                                header: "Contact",
                                render: (company) => (
                                    <div className="text-[13px]">
                                        <div className="text-[#e2e8f0]">{company.contactPerson || '—'}</div>
                                        <div className="text-[#64748b] text-xs">{company.contactEmail}</div>
                                    </div>
                                ),
                                cellClassName: "text-[#e2e8f0] text-sm",
                            },
                            {
                                header: "Documents",
                                render: (company) => {
                                    const docCount = getDocumentCount(company.documents);
                                    const allRequiredUploaded = getRequiredDocsUploaded(company.documents);
                                    return (
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
                                    );
                                },
                                cellClassName: "text-[#e2e8f0] text-sm",
                            },
                            {
                                header: "Status",
                                render: (company) => {
                                    const allRequiredUploaded = getRequiredDocsUploaded(company.documents);
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 py-1.5 px-3 rounded-[20px] text-[11px] font-semibold uppercase ${allRequiredUploaded ? 'bg-[rgba(16,185,129,0.15)] text-[#34d399]' : 'bg-[rgba(245,158,11,0.15)] text-[#fbbf24]'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {allRequiredUploaded ? 'Ready' : 'Incomplete'}
                                        </span>
                                    );
                                },
                                cellClassName: "text-[#e2e8f0] text-sm",
                            },
                            {
                                header: "Submitted",
                                render: (company) => (
                                    <span className="text-[13px] text-[#94a3b8]">
                                        {new Date(company.createdAt).toLocaleDateString()}
                                    </span>
                                ),
                            },
                            {
                                header: "Actions",
                                render: (company) => (
                                    <Button
                                        variant="primary"
                                        onClick={() => selectCompany(company)}
                                        className="py-2 px-[18px] rounded-lg text-[13px] font-semibold"
                                    >
                                        Review
                                    </Button>
                                ),
                                cellClassName: "text-[#e2e8f0] text-sm",
                            },
                        ]}
                        data={pendingCompanies}
                        rowKey={(company) => company.id}
                        emptyMessage="No pending company requests."
                    />
                </div>
            )}

            {/* Company Review Modal */}
            {selectedCompany && (
                <CompanyReviewModal
                    company={selectedCompany}
                    onClose={clearSelectedCompany}
                    onApprove={handleApprove}
                    onReject={openRejectModal}
                />
            )}

            {/* Rejection Reason Modal */}
            {showRejectModal && selectedCompany && (
                <RejectCompanyModal
                    companyId={selectedCompany.id}
                    companyName={selectedCompany.companyName}
                    onClose={closeRejectModal}
                    onSuccess={handleRejectSuccess}
                />
            )}
        </div>
    );
};

export default AdminCompanyRequestsPage;
