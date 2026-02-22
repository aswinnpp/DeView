import { useState, useCallback } from "react";
import { useAdminCompanyManagement } from "@/hooks/admin/useAdminCompanyManagement";
import { CompanyReviewModal, RejectCompanyModal } from "@/components/admin";
import { Table, SearchInput, Button } from "@/components/common";
import type { CompanyApproval } from "@/services/adminCompanyManagement.service";

const AdminCompanyManagement = () => {
  const {
    loading,
    error,
    companies,
    total,
    page,
    totalPages,
    statusFilter,
    sortOrder,
    handleSearch,
    handleStatusFilter,
    handleSortOrder,
    goToPage,
    toggleCompany,
    refetch,
  } = useAdminCompanyManagement();

  const [selectedCompany, setSelectedCompany] =
    useState<CompanyApproval | null>(null);

  const [toggleTarget, setToggleTarget] =
    useState<CompanyApproval | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);

  const confirmToggle = async () => {
    if (!toggleTarget) return;

    await toggleCompany(toggleTarget.id);
    setToggleTarget(null);
  };

  const handleRejectSuccess = useCallback(() => {
    setSelectedCompany(null);
    setShowRejectModal(false);
    refetch();
  }, [refetch]);

  // ─────────────────────────

 

  if (error)
    return (
      <div className="text-center py-20 text-red-400">
        {error}
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto">

      <div className="mb-6">
        <div className="mb-4">
          <h1 className="m-0 text-[24px] font-semibold text-slate-50">
            Company Directory
          </h1>
          <p className="mt-1.5 mb-0 text-sm text-slate-400">
            Browse and manage all approved companies on the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 justify-between">
          <div className="flex-1 min-w-[260px]">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search by company name or email..."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="min-w-[200px]">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Status
              </label>
              <div className="flex bg-slate-900/70 border border-slate-700 rounded-lg p-1 gap-1">
                {[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleStatusFilter(
                        option.value as "all" | "active" | "inactive"
                      )
                    }
                    className={`flex-1 text-[12px] font-medium py-1.5 px-2 rounded-md transition-colors ${
                      statusFilter === option.value
                        ? "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.45)]"
                        : "bg-transparent text-slate-300 hover:bg-slate-800/80"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
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
      </div>

      <Table
        data={companies}
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
            header: "Status",
            render: (c) => (c.isActive ? "Active" : "Inactive"),
          },
          {
            header: "Actions",
            render: (c) => (
              <div className="flex gap-2 items-center">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedCompany(c)}
                  className="py-1.5 px-3 text-xs font-semibold bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[#e2e8f0] transition-colors"
                >
                  View
                </Button>
                <Button
                  variant={c.isActive ? "danger" : "primary"}
                  onClick={() => setToggleTarget(c)}
                  className="py-1.5 px-3 text-xs font-semibold transition-colors"
                >
                  {c.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ),
          },
        ]}
      />

      {!loading && total > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-4">
          <p className="text-sm text-slate-400">
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedCompany && (
        <CompanyReviewModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onReject={() => setShowRejectModal(true)}
        />
      )}

      {showRejectModal && selectedCompany && (
        <RejectCompanyModal
          companyId={selectedCompany.id}
          companyName={selectedCompany.companyName}
          onClose={() => setShowRejectModal(false)}
          onSuccess={handleRejectSuccess}
        />
      )}

      {toggleTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Confirm {toggleTarget.isActive ? "Deactivate" : "Activate"} Company
            </h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to {toggleTarget.isActive ? "deactivate" : "activate"}{" "}
              <span className="font-semibold text-white">{toggleTarget.companyName}</span>?
            </p>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setToggleTarget(null)}
                className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-[#e2e8f0]"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant={toggleTarget.isActive ? "danger" : "primary"}
                onClick={confirmToggle}
                className="px-4 py-2"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanyManagement;
