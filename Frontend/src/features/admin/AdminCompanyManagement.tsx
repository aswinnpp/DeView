import { useAdminCompanyManagement } from "@/hooks/admin/useAdminCompanyManagement";
import { CompanyReviewModal, RejectCompanyModal } from "@/components/admin";

const AdminCompanyManagement = () => {
    const {
        filteredCompanies,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCompany,
        selectCompany,
        clearSelectedCompany,
        handleToggleActive,
        showRejectModal,
        openRejectModal,
        closeRejectModal,
        handleRejectSuccess,
        fetchCompanies,
    } = useAdminCompanyManagement();

    const renderTable = () => {
        if (isLoading) {
            return (
                <div className="text-center py-[60px]">
                    <div className="text-5xl mb-4">⏳</div>
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
                        onClick={fetchCompanies}
                        className="mt-4 py-2 px-4 bg-indigo-500 border-none text-white rounded-lg cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-6">
                <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse table-fixed min-w-[800px]">
                            <thead className="bg-slate-900/80 border-b border-slate-700">
                                <tr>
                                    <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.5px] whitespace-nowrap border-b border-slate-700">Company Name</th>
                                    <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.5px] whitespace-nowrap border-b border-slate-700">Contact Email</th>
                                    <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.5px] whitespace-nowrap border-b border-slate-700">Status</th>
                                    <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.5px] whitespace-nowrap border-b border-slate-700">Submitted</th>
                                    <th className="py-3.5 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-[0.5px] whitespace-nowrap border-b border-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompanies.map((company) => {
                                    const submittedLabel = new Date(company.createdAt).toLocaleDateString();
                                    return (
                                        <tr key={company.id} className="border-b border-slate-700/50 transition-colors duration-200 hover:bg-indigo-500/5 last:border-b-0">
                                            <td className="p-4 align-middle text-slate-200 text-sm overflow-hidden text-ellipsis font-medium">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-white">
                                                        {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                                                    </div>
                                                    <strong>{company.companyName}</strong>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-[13px] text-slate-400 overflow-hidden text-ellipsis">{company.contactEmail}</td>
                                            <td className="p-4 align-middle text-slate-200 text-sm overflow-hidden text-ellipsis">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.3px] ${company.isActive
                                                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                                                    }`}>
                                                    {company.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-slate-200 text-sm overflow-hidden text-ellipsis">{submittedLabel}</td>
                                            <td className="p-4 align-middle text-slate-200 text-sm overflow-hidden text-ellipsis">
                                                <div className="flex gap-2">
                                                    <button
                                                        className="px-3.5 py-1.5 bg-white/5 border border-slate-600 rounded-md text-slate-200 text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-indigo-500 hover:text-white"
                                                        onClick={() => selectCompany(company)}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className={`px-3 py-1 border-none rounded-md text-white text-xs font-semibold cursor-pointer transition-all duration-200 hover:opacity-90 hover:-translate-y-px ${company.isActive ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                        onClick={() => handleToggleActive(company.id)}
                                                        title={company.isActive ? "Deactivate company" : "Activate company"}
                                                    >
                                                        {company.isActive ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCompanies.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center p-5">
                                            No companies match this filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
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
                <div className="relative">
                    <input
                        className="w-80 py-2.5 px-4 bg-slate-900/80 border border-slate-700 rounded-lg text-slate-200 text-sm transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]"
                        placeholder="Search by name, email, or contact person"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {renderTable()}

            {/* Company Review Modal (reused from components/admin) */}
            {selectedCompany && (
                <CompanyReviewModal
                    company={selectedCompany}
                    onClose={clearSelectedCompany}
                    onReject={openRejectModal}
                />
            )}

            {/* Rejection Modal (reused from components/admin) */}
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

export default AdminCompanyManagement;
