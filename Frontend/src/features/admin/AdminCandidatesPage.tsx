import { useState, useCallback } from "react";
import { Button, SearchInput, Table, Pagination } from "../../components/common";
import { useAdminCandidates } from "../../hooks/admin/useAdminCandidates";

interface ICandidate {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
}

const AdminCandidatesPage = () => {
    const {
        candidates,
        total,
        page,
        totalPages,
        sortOrder,
        error,
        handleSearch,
        handleSortOrder,
        goToPage,
        toggleCandidateStatus,
        actionLoading,
    } = useAdminCandidates();
    const [confirmModal, setConfirmModal] = useState<{ 
        open: boolean; 
        candidate: ICandidate | null; 
        action: "activate" | "deactivate" 
    }>({
        open: false,
        candidate: null,
        action: "deactivate"
    });

    const formatDateFromId = (id: string) => {
        if (!/^[a-fA-F0-9]{24}$/.test(id)) return "—";
        const seconds = Number.parseInt(id.slice(0, 8), 16);
        if (!Number.isFinite(seconds)) return "—";
        const date = new Date(seconds * 1000);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const openConfirmModal = (candidate: ICandidate, action: "activate" | "deactivate") => {
        setConfirmModal({ open: true, candidate, action });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ open: false, candidate: null, action: "deactivate" });
    };

    const handleConfirmToggle = async () => {
        if (!confirmModal.candidate) return;
        await toggleCandidateStatus(confirmModal.candidate.id);
        closeConfirmModal();
    };

    const searchCallback = useCallback(
        (query: string) => handleSearch(query, sortOrder),
        [handleSearch, sortOrder]
    );

    return (
        <div className="max-w-[1400px] mx-auto w-full min-w-0 text-slate-200 font-['Inter',sans-serif] pb-10">
            {/* Header */}
            <div className="mb-6 max-md:mb-5">
                <h1 className="m-0 text-[28px] max-md:text-[22px] font-bold text-slate-50">
                    Candidate Management
                </h1>
                <p className="mt-2 mb-0 text-slate-400 text-sm max-md:text-xs">
                    View and manage all candidates registered on the platform
                </p>
            </div>

            {/* Search and Order Controls */}
            <div className="flex flex-wrap items-end gap-4 mb-6 max-md:gap-3">
                <div className="flex-1 min-w-0 w-full max-md:min-w-0">
                    <SearchInput
                        placeholder="Search by name or email..."
                        onSearch={searchCallback}
                    />
                </div>
                <div className="min-w-[130px]">
                    <label className="block text-[12px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">
                        Order
                    </label>
                    <select
                        value={sortOrder}
                        onChange={(e) => {
                            handleSortOrder(e.target.value as "asc" | "desc");
                        }}
                        className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-lg text-[14px] text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Candidates Table */}
            <div>
                {!!error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
                        {error}
                    </div>
                )}
                {/* Mobile: card list (no avatar) */}
                <div className="md:hidden space-y-3">
                    {candidates.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No candidates found matching your criteria.</p>
                    ) : (
                        candidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4"
                            >
                                <div className="text-slate-50 font-semibold text-[15px] mb-1">
                                    {candidate.fullName}
                                </div>
                                <div className="text-slate-400 text-[13px] mb-2 break-all">
                                    {candidate.email}
                                </div>
                                <div className="text-slate-500 text-[12px] mb-3">
                                    Registered {formatDateFromId(candidate.id)}
                                </div>
                                <Button
                                    onClick={() => openConfirmModal(
                                        candidate,
                                        candidate.isActive ? "deactivate" : "activate"
                                    )}
                                    disabled={actionLoading === candidate.id}
                                    className={`w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg text-[13px] font-semibold text-white transition-all border-none ${
                                        candidate.isActive
                                            ? "bg-gradient-to-br from-red-500 to-red-600"
                                            : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                    } ${actionLoading === candidate.id ? "opacity-60 cursor-not-allowed" : ""}`}
                                >
                                    {actionLoading === candidate.id
                                        ? "Processing..."
                                        : candidate.isActive
                                            ? "Deactivate"
                                            : "Activate"}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
                {/* Desktop: table (with avatar) */}
                <div className="hidden md:block">
                    <Table
                        columns={[
                            {
                                header: "Candidate",
                                render: (candidate: ICandidate) => (
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(15,23,42,0.6)] ${
                                                !candidate.isActive
                                                    ? "bg-gradient-to-br from-red-500 to-red-600"
                                                    : "bg-gradient-to-br from-indigo-500 to-indigo-600"
                                            }`}
                                        >
                                            {candidate.fullName
                                                .split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                                .slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-slate-50 font-semibold text-[14px]">
                                                {candidate.fullName}
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: "Contact",
                                render: (candidate: ICandidate) => (
                                    <div>
                                        <div className="text-slate-100 text-[13px]">
                                            {candidate.email}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: "Registered",
                                render: (candidate: ICandidate) => (
                                    <span className="text-[13px] text-slate-400">
                                        {formatDateFromId(candidate.id)}
                                    </span>
                                ),
                            },
                            {
                                header: "Actions",
                                cellClassName: "text-left",
                                render: (candidate: ICandidate) => (
                                    <div className="flex items-center">
                                        <Button
                                            onClick={() => openConfirmModal(
                                                candidate,
                                                candidate.isActive ? "deactivate" : "activate"
                                            )}
                                            disabled={actionLoading === candidate.id}
                                            className={`inline-flex items-center justify-center py-2 px-4 rounded-md text-[13px] font-semibold text-white transition-all border-none ${
                                                candidate.isActive
                                                    ? "bg-gradient-to-br from-red-500 to-red-600"
                                                    : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                            } ${
                                                actionLoading === candidate.id
                                                    ? "opacity-60 cursor-not-allowed"
                                                    : "hover:-translate-y-0.5 shadow-[0_4px_12px_rgba(15,23,42,0.5)]"
                                            }`}
                                        >
                                            {actionLoading === candidate.id
                                                ? "Processing..."
                                                : candidate.isActive
                                                    ? "Deactivate"
                                                    : "Activate"}
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        data={candidates}
                        rowKey={(candidate) => candidate.id}
                        emptyMessage="No candidates found matching your criteria."
                    />
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.open && confirmModal.candidate && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center px-4 max-md:px-2">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl max-md:rounded-xl p-7 max-md:p-5 w-[420px] max-w-[calc(100vw-1rem)] shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
                        <h3 className="m-0 mb-4 max-md:mb-3 text-[20px] max-md:text-lg text-slate-50 font-semibold flex items-center gap-2.5 max-md:gap-2">
                            <span
                                className={
                                    confirmModal.action === 'deactivate'
                                        ? 'text-xl max-md:text-lg text-red-400'
                                        : 'text-xl max-md:text-lg text-emerald-400'
                                }
                            >
                                {confirmModal.action === 'deactivate' ? 'Deactivate' : 'Activate'}
                            </span>
                            <span className="max-md:text-base">
                                {confirmModal.action === 'deactivate'
                                    ? 'Candidate'
                                    : 'Candidate'}
                            </span>
                        </h3>
                        <p className="m-0 mb-6 max-md:mb-4 text-[14px] max-md:text-sm text-slate-400 leading-relaxed">
                            Are you sure you want to{' '}
                            <strong
                                className={
                                    confirmModal.action === 'deactivate'
                                        ? 'text-red-400'
                                        : 'text-emerald-400'
                                }
                            >
                                {confirmModal.action}
                            </strong>{' '}
                            <strong className="text-slate-50">
                                {confirmModal.candidate.fullName}
                            </strong>
                            ?
                            {confirmModal.action === 'deactivate'
                                ? ' They will not be able to access the platform or apply to jobs.'
                                : ' They will regain full access to the platform.'}
                        </p>
                        <div className="flex flex-wrap justify-end gap-3 max-md:gap-2 max-md:flex-col">
                            <Button
                                variant="secondary"
                                onClick={closeConfirmModal}
                                className="inline-flex items-center justify-center py-2.5 px-5 max-md:w-full rounded-lg bg-white/5 border border-white/10 text-[14px] max-md:text-sm font-semibold text-slate-400 hover:bg-white/10 transition"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmToggle}
                                disabled={actionLoading === confirmModal.candidate.id}
                                className={`inline-flex items-center justify-center py-2.5 px-5 max-md:w-full rounded-lg text-[14px] max-md:text-sm font-semibold text-white border-none ${
                                    confirmModal.action === 'deactivate'
                                        ? 'bg-gradient-to-br from-red-500 to-red-600'
                                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                } ${
                                    actionLoading === confirmModal.candidate.id
                                        ? 'opacity-60 cursor-not-allowed'
                                        : 'hover:opacity-90'
                                }`}
                            >
                                {actionLoading === confirmModal.candidate.id
                                    ? 'Processing...'
                                    : `Confirm ${confirmModal.action === 'deactivate' ? 'Deactivate' : 'Activate'}`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCandidatesPage;
