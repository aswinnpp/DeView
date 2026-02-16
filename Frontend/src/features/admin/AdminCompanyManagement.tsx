import { useState ,useCallback } from "react";
import { useAdminCompanyManagement } from "@/hooks/admin/useAdminCompanyManagement";
import { CompanyReviewModal, RejectCompanyModal } from "@/components/admin";
import { Table, SearchInput, Button } from "@/components/common";
import type { CompanyApproval } from "@/services/adminCompanyManagement.service";

const AdminCompanyManagement = () => {
  const {
    loading,
    error,
    data: { companies, fetchCompanies, toggleCompany },
  } = useAdminCompanyManagement();

  const [selectedCompany, setSelectedCompany] =
    useState<CompanyApproval | null>(null);

  const [toggleTarget, setToggleTarget] =
    useState<CompanyApproval | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);

  // ───────── Search ─────────

  const handleSearch = useCallback(
    (q: string) => {
      fetchCompanies(q);
    },
    [fetchCompanies]
  );

  // ───────── Toggle ─────────

  const confirmToggle = async () => {
    if (!toggleTarget) return;

    await toggleCompany(toggleTarget.id);
    setToggleTarget(null);
  };

  const handleRejectSuccess = () => {
    setSelectedCompany(null);
    setShowRejectModal(false);
    fetchCompanies();
  };

  // ─────────────────────────

 

  if (error)
    return (
      <div className="text-center py-20 text-red-400">
        {error}
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto">

      <div className="flex justify-end mb-4">
        <SearchInput onSearch={handleSearch} />
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
