import { useState, useCallback } from "react";
import { useAdminCompanyRequests } from "@/hooks/admin/useAdminCompanyRequests";
import { CompanyReviewModal, RejectCompanyModal } from "@/components/admin";
import { Table, SearchInput, Button, Pagination } from "@/components/common";

const AdminCompanyRequestsPage = () => {
  const {
    pendingCompanies,
    total,
    page,
    totalPages,
    sortOrder,
    initialLoading,
    error,
    handleSearch,
    handleSortOrder,
    goToPage,
    selectedCompany,
    selectCompany,
    clearSelectedCompany,
    handleApprove,
    handleRejectSuccess,
  } = useAdminCompanyRequests();

  const [showRejectModal, setShowRejectModal] = useState(false);

  const onRejectSuccess = useCallback(() => {
    handleRejectSuccess();
    setShowRejectModal(false);
  }, [handleRejectSuccess]);

  if (error) {
    return (
      <div className="text-center py-20 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full min-w-0">
      <div className="mb-6 max-md:mb-4">
        <div className="mb-4 max-md:mb-3">
          <h1 className="m-0 text-[24px] max-md:text-[20px] font-semibold text-slate-50">
            Company Approval Requests
          </h1>
          <p className="mt-1.5 mb-0 text-sm max-md:text-xs text-slate-400">
            Review and process new company registrations waiting for approval.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 justify-between max-md:gap-3">
          <div className="flex-1 min-w-0 w-full max-md:min-w-0">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search by company name or email..."
            />
          </div>

          <div className="min-w-[150px]">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              Sort by
            </label>
            <select
              value={sortOrder}
              onChange={(e) =>
                handleSortOrder(e.target.value as "asc" | "desc")
              }
              className="w-full py-2.5 px-3.5 bg-slate-900/80 border border-slate-700 rounded-lg text-[13px] text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>
        </div>
      </div>

      {initialLoading ? (
        <div className="text-center py-20 text-slate-400">
          Loading pending requests...
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3">
            {pendingCompanies.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No pending requests.</p>
            ) : (
              pendingCompanies.map((c) => (
                <div
                  key={c.id}
                  className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4"
                >
                  <div className="text-slate-50 font-semibold text-[15px] mb-1">{c.companyName}</div>
                  <div className="text-slate-400 text-[13px] mb-2 break-all">{c.contactEmail}</div>
                  <div className="text-slate-500 text-[12px] mb-3">
                    Submitted{" "}
                    {new Date(c.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => selectCompany(c)}
                    className="w-full py-2.5 px-3 text-sm font-semibold bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[#e2e8f0] transition-colors"
                  >
                    Review
                  </Button>
                </div>
              ))
            )}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table
              data={pendingCompanies}
              rowKey={(c) => c.id}
              columns={[
                {
                  header: "Company",
                  render: (c) => c.companyName,
                },
                {
                  header: "Email",
                  render: (c) => c.contactEmail,
                },
                {
                  header: "Submitted",
                  render: (c) =>
                    new Date(c.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }),
                },
                {
                  header: "Actions",
                  render: (c) => (
                    <Button
                      variant="secondary"
                      onClick={() => selectCompany(c)}
                      className="py-1.5 px-3 text-xs font-semibold bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[#e2e8f0] transition-colors"
                    >
                      Review
                    </Button>
                  ),
                },
              ]}
            />
          </div>

          {total > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </>
      )}

      {selectedCompany && (
        <CompanyReviewModal
          company={selectedCompany}
          onClose={clearSelectedCompany}
          onReject={() => setShowRejectModal(true)}
          onApprove={handleApprove}
        />
      )}

      {showRejectModal && selectedCompany && (
        <RejectCompanyModal
          companyId={selectedCompany.id}
          companyName={selectedCompany.companyName}
          onClose={() => setShowRejectModal(false)}
          onSuccess={onRejectSuccess}
        />
      )}
    </div>
  );
};

export default AdminCompanyRequestsPage;
