import { useAdminCompanyManagement } from "@/hooks/admin/useAdminCompanyManagement";
import { CompanyReviewModal, RejectCompanyModal } from "@/components/admin";
import { Table, SearchInput } from "@/components/common";

const AdminCompanyManagement = () => {
    const {
        companies,
        isLoading,
        error,
        searchQuery,
        handleSearch,
        selectedCompany,
        selectCompany,
        clearSelectedCompany,
        showRejectModal,
        openRejectModal,
        closeRejectModal,
        handleRejectSuccess,
        fetchCompanies,
        toggleTarget,
        isToggling,
        requestToggle,
        confirmToggle,
        cancelToggle,
    } = useAdminCompanyManagement();

    const renderTable = () => {
        if (isLoading) {
            return (
                <div className="text-center py-[60px]">

                    <h3 className="text-slate-100">Loading companies...</h3>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-[60px]">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h3 className="text-red-400">{error}</h3>
                    <button
                        onClick={() => fetchCompanies()}
                        className="mt-4 py-2 px-4 bg-indigo-500 border-none text-white rounded-lg cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return (
            <Table
                columns={[
                    {
                        header: "Company Name",
                        render: (company) => (
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white">
                                    {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                                </div>
                                <strong className="text-slate-200">{company.companyName}</strong>
                            </div>
                        ),
                        cellClassName: "text-slate-200 text-sm overflow-hidden text-ellipsis font-medium",
                    },
                    {
                        header: "Contact Email",
                        render: (company) => company.contactEmail,
                        cellClassName: "text-[13px] text-slate-400 overflow-hidden text-ellipsis",
                    },
                    {
                        header: "Status",
                        render: (company) => (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.3px] ${company.isActive
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                : 'bg-red-500/15 text-red-500 border border-red-500/30'
                                }`}>
                                {company.isActive ? 'Active' : 'Inactive'}
                            </span>
                        ),
                    },
                    {
                        header: "Submitted",
                        render: (company) => (
                            <span className="text-slate-200 text-sm">
                                {new Date(company.createdAt).toLocaleDateString()}
                            </span>
                        ),
                    },
                    {
                        header: "Actions",
                        render: (company) => (
                            <div className="flex gap-2">
                                <button
                                    className="px-3.5 py-1.5 bg-white/5 border border-slate-600 rounded-md text-slate-200 text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-indigo-500 hover:text-white"
                                    onClick={() => selectCompany(company)}
                                >
                                    View
                                </button>
                                <button
                                    className={`px-3 py-1 border-none rounded-md text-white text-xs font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px ${company.isActive ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    onClick={() => requestToggle(company)}
                                    title={company.isActive ? "Deactivate company" : "Activate company"}
                                >
                                    {company.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        ),
                    },
                ]}
                data={companies}
                rowKey={(company) => company.id}
                emptyMessage={searchQuery ? 'No companies match your search.' : 'No companies found.'}
            />
        );
    };

    return (
        <div className="max-w-[1400px] mx-auto">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-[28px] font-bold text-slate-100 m-0 mb-1">Company Management</h2>
                    <p className="text-sm text-slate-400 m-0">Review, approve, and manage companies.</p>
                </div>
            </header>

            <div className="flex justify-end mb-4">
                <div className="w-80">
                    <SearchInput
                        placeholder="Search by name, email, or contact person"
                        onSearch={handleSearch}
                    />
                </div>
            </div>

            {renderTable()}

            {/* Company Review Modal */}
            {selectedCompany && (
                <CompanyReviewModal
                    company={selectedCompany}
                    onClose={clearSelectedCompany}
                    onReject={openRejectModal}
                />
            )}

            {/* Rejection Modal */}
            {showRejectModal && selectedCompany && (
                <RejectCompanyModal
                    companyId={selectedCompany.id}
                    companyName={selectedCompany.companyName}
                    onClose={closeRejectModal}
                    onSuccess={handleRejectSuccess}
                />
            )}

            {/* ── Toggle Confirmation Warning Modal ─────────────────── */}
            {toggleTarget && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-[6px] flex items-center justify-center z-[1200]">
                    <div
                        className={`bg-linear-to-b from-[#1e293b] to-[#0f172a] rounded-2xl p-6 max-w-[420px] w-full border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] ${toggleTarget.isActive
                            ? "border-red-500/25"
                            : "border-emerald-500/25"
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${toggleTarget.isActive
                                    ? "bg-red-500/15 text-red-400"
                                    : "bg-emerald-500/15 text-emerald-400"
                                    }`}
                            >
                                {toggleTarget.isActive ? "⚠" : "✓"}
                            </div>
                            <div>
                                <h4 className="m-0 text-lg text-slate-100 font-semibold">
                                    {toggleTarget.isActive ? "Deactivate Company?" : "Activate Company?"}
                                </h4>
                            </div>
                        </div>

                        {/* Message */}
                        <p className="m-0 mb-5 text-slate-400 text-sm leading-relaxed">
                            Are you sure you want to{" "}
                            <span className={`font-semibold ${toggleTarget.isActive ? "text-red-400" : "text-emerald-400"}`}>
                                {toggleTarget.isActive ? "deactivate" : "activate"}
                            </span>{" "}
                            <span className="text-slate-200 font-medium">{toggleTarget.companyName}</span>?
                            {toggleTarget.isActive
                                ? " This will restrict the company's access to the platform."
                                : " This will restore the company's access to the platform."}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={cancelToggle}
                                disabled={isToggling}
                                className="py-2.5 px-5 bg-white/5 border border-slate-600 rounded-lg text-slate-300 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmToggle}
                                disabled={isToggling}
                                className={`py-2.5 px-5 border-none rounded-lg text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${toggleTarget.isActive
                                    ? "bg-red-500"
                                    : "bg-emerald-500"
                                    }`}
                            >
                                {isToggling ? (
                                    <>
                                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    toggleTarget.isActive ? "Yes, Deactivate" : "Yes, Activate"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanyManagement;
