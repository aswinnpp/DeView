import { useMemo } from "react";
import { useAdminCompanyRequests, type CompanyApproval } from "../../hooks/admin";
import { Button, SearchInput, Table } from "../../components/common";
import { CompanyReviewModal, RejectCompanyModal } from "../../components/admin";

const AdminCompanyRequestsPage = () => {
  const {
    pendingCompanies,
    initialLoading,
    isFetching,
    isPending,
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

  const showSkeleton = initialLoading && pendingCompanies.length === 0;

  // ✅ Memoized columns (prevents full table redraw)
  const columns = useMemo(
    () => [
      {
        header: "Company",
        render: (company: CompanyApproval) => (
          <div className="flex items-center gap-2.5">
            <div className="w-[42px] h-[42px] rounded-full bg-linear-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-base font-bold text-white">
              {company.companyName?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <strong className="text-[#f1f5f9] font-semibold">
                {company.companyName}
              </strong>
              <div className="text-xs text-[#64748b]">
                {company.taxId || "No Tax ID"}
              </div>
            </div>
          </div>
        ),
      },
      {
        header: "Contact",
        render: (company: CompanyApproval) => (
          <div className="text-[13px]">
            <div className="text-[#e2e8f0]">
              {company.contactPerson || "—"}
            </div>
            <div className="text-[#64748b] text-xs">
              {company.contactEmail}
            </div>
          </div>
        ),
      },
      {
        header: "Documents",
        render: (company: CompanyApproval) => {
          const docCount = getDocumentCount(company.documents);
          const percent = docCount.total
            ? (docCount.uploaded / docCount.total) * 100
            : 0;

          const ready = getRequiredDocsUploaded(company.documents);

          return (
            <div className="flex items-center gap-2">
              <div className="w-15 h-1.5 bg-[rgba(100,116,139,0.3)] rounded-sm overflow-hidden">
                <div
                  className={`h-full ${
                    ready
                      ? "bg-linear-to-r from-[#10b981] to-[#34d399]"
                      : "bg-linear-to-r from-[#f59e0b] to-[#fbbf24]"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span
                className={`text-xs font-semibold ${
                  ready ? "text-[#10b981]" : "text-[#f59e0b]"
                }`}
              >
                {docCount.uploaded}/{docCount.total}
              </span>
            </div>
          );
        },
      },
      {
        header: "Status",
        render: (company: CompanyApproval) =>
          getRequiredDocsUploaded(company.documents)
            ? "Ready"
            : "Incomplete",
      },
      {
        header: "Submitted",
        render: (company: CompanyApproval) =>
          new Date(company.createdAt).toLocaleDateString(),
      },
      {
        header: "Actions",
        render: (company: CompanyApproval) => (
          <Button variant="primary" onClick={() => selectCompany(company)}>
            Review
          </Button>
        ),
      },
    ],
    [getDocumentCount, getRequiredDocsUploaded, selectCompany]
  );

  return (
    <div className="max-w-[1400px] mx-auto min-h-[400px]">

 
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 rounded-xl flex justify-between">
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="secondary" onClick={() => fetchPendingCompanies()}>
            Retry
          </Button>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <SearchInput
          placeholder="Search companies..."
          onSearch={handleSearch}
        />
     
      </div>

      {showSkeleton ? (
        <div className="animate-pulse rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50">
          <div className="h-12 bg-slate-700/50" />
          <div className="h-14 bg-slate-700/30" />
          <div className="h-14 bg-slate-700/30" />
          <div className="h-14 bg-slate-700/30" />
          <div className="h-14 bg-slate-700/30" />
        </div>
      ) : (
        <Table
          columns={columns}
          data={pendingCompanies}
          rowKey={(c) => c.id}
          emptyMessage={
            searchQuery
              ? "No companies match your search."
              : "No pending company requests."
          }
        />
      )}

      {selectedCompany && (
        <CompanyReviewModal
          company={selectedCompany}
          onClose={clearSelectedCompany}
          onApprove={handleApprove}
          onReject={openRejectModal}
        />
      )}

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
