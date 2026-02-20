import { useState } from "react";
import { Button, SearchInput, Table } from "../../components/common";
import { useAdminCandidates } from "../../hooks/admin/useAdminCandidates";

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    isActive: boolean;
}

const AdminCandidatesPage = () => {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const { candidates, loading, error, handleSearch, handleSortOrder, toggleCandidateStatus, actionLoading } =
        useAdminCandidates();
    const [confirmModal, setConfirmModal] = useState<{ 
        open: boolean; 
        candidate: Candidate | null; 
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

    const openConfirmModal = (candidate: Candidate, action: "activate" | "deactivate") => {
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

    return (
        <div className="max-w-[1400px] mx-auto text-slate-200 font-['Inter',sans-serif] pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="m-0 text-[28px] font-bold text-slate-50">
                    Candidate Management
                </h1>
                <p className="mt-2 mb-0 text-slate-400 text-sm">
                    View and manage all candidates registered on the platform
                </p>
            </div>

            {/* Search and Order Controls */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
                <div className="flex-1 min-w-[280px]">
                    <SearchInput
                        placeholder="Search by name or email..."
                        onSearch={(query) => handleSearch(query, sortOrder)}
                    />
                </div>
                <div className="min-w-[130px]">
                    <label className="block text-[12px] text-slate-400 mb-1.5 font-semibold uppercase tracking-wide">
                        Order
                    </label>
                    <select
                        value={sortOrder}
                        onChange={(e) => {
                            const newSortOrder = e.target.value as "asc" | "desc";
                            setSortOrder(newSortOrder);
                            handleSortOrder(newSortOrder);
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
                {loading ? (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-xl overflow-hidden text-center py-14 text-slate-400">
                        <div className="text-2xl mb-4">⏳</div>
                        <p className="m-0 text-sm">Loading candidates...</p>
                    </div>
                ) : (
                    <Table
                        columns={[
                            {
                                header: "Candidate",
                                render: (candidate: Candidate) => (
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
                                render: (candidate: Candidate) => (
                                    <div>
                                        <div className="text-slate-100 text-[13px]">
                                            {candidate.email}
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                header: "Registered",
                                render: (candidate: Candidate) => (
                                    <span className="text-[13px] text-slate-400">
                                        {formatDateFromId(candidate.id)}
                                    </span>
                                ),
                            },
                            {
                                header: "Actions",
                                cellClassName: "text-left",
                                render: (candidate: Candidate) => (
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
                )}
            </div>

            {/* Confirmation Modal */}
            {confirmModal.open && confirmModal.candidate && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center px-4">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 rounded-2xl p-7 w-[420px] max-w-[90vw] shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
                        <h3 className="m-0 mb-4 text-[20px] text-slate-50 font-semibold flex items-center gap-2.5">
                            <span>{confirmModal.action === 'deactivate' ? '🚫' : '✅'}</span>
                            {confirmModal.action === 'deactivate'
                                ? 'Deactivate Candidate'
                                : 'Activate Candidate'}
                        </h3>
                        <p className="m-0 mb-6 text-[14px] text-slate-400 leading-relaxed">
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
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={closeConfirmModal}
                                className="inline-flex items-center justify-center py-2.5 px-5 rounded-lg bg-white/5 border border-white/10 text-[14px] font-semibold text-slate-400 hover:bg-white/10 transition"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmToggle}
                                disabled={actionLoading === confirmModal.candidate.id}
                                className={`inline-flex items-center justify-center py-2.5 px-5 rounded-lg text-[14px] font-semibold text-white border-none ${
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
