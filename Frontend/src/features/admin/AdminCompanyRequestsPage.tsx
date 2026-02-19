import { useState, useCallback } from "react";
import { useAdminCompanyRequests } from "@/hooks/admin/useAdminCompanyRequests";
import { CompanyReviewModal, RejectCompanyModal } from "@/components/admin";
import { Table, SearchInput, Button } from "@/components/common";

const AdminCompanyRequestsPage = () => {
  const {
    pendingCompanies,
    initialLoading,
    error,
    handleSearch,
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
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-end mb-4">
        <SearchInput onSearch={handleSearch} />
      </div>

      {initialLoading ? (
        <div className="text-center py-20 text-slate-400">
          Loading pending requests...
        </div>
      ) : (
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
