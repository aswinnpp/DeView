import { useState, useCallback } from "react";
import { useManageTeam } from "../../hooks/company/useManageTeam";
import { Table, SearchInput } from "../../components/common";
import type { TeamMember } from "../../services/companyTeam.service";


type memberToggle = {
    id: string;
    name: string;
    action: string;
}
const ManageHRPage = () => {
    const {
        activeTab,
        allMembers,
        isLoading,
        error,
        searchQuery,
        statusFilter,
        tabLabel,
        switchTab,
        handleSearch,
        handleStatusFilter,
        createMember,
        confirmToggle,
        page,
        total,
        totalPages,
        goToPage,
    } = useManageTeam();

    const [newMember, setNewMember] = useState({ name: "", email: "" });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [memberToToggle, setMemberToToggle] = useState<memberToggle | null>(null);


    const openCreateModal = useCallback(() => setShowCreateModal(true), []);
    const closeCreateModal = useCallback(() => setShowCreateModal(false), []);


    const requestToggle = useCallback((member: TeamMember) => {
        const action = member.isActive ? "deactivate" : "activate";
        setMemberToToggle({ id: member.id, name: member.fullName, action });
    }, []);

    const cancelToggle = useCallback(() => setMemberToToggle(null), []);


    const hasAccess = true;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await createMember({ fullName: newMember.name, email: newMember.email });
        setNewMember({ name: "", email: "" });
        closeCreateModal()
    };

    return (
        <div className=" mx-auto ">
            {/* Header */}
            <header className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-[22px] font-bold text-slate-100 m-0">Team Management</h2>
                    <p className="text-slate-400 mt-2 mb-0">Create and manage HR and Interviewer accounts for your company.</p>
                </div>
                {hasAccess && (
                    <button
                        className="bg-linear-to-br from-indigo-500 to-violet-500 py-1.5 px-3.5 text-[13px] font-semibold rounded-md border-none text-white cursor-pointer whitespace-nowrap w-fit h-fit shrink-0 hover:opacity-90 transition-all duration-200"
                        onClick={openCreateModal}
                    >
                        + Create {tabLabel}
                    </button>
                )}
            </header>

            <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl mb-6 w-fit border border-slate-700/50">
                <button
                    onClick={() => switchTab("hr")}
                    className={`py-2 px-5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-200 ${activeTab === "hr"
                        ? "bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                        : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        }`}
                >
                    HR Members

                </button>
                <button
                    onClick={() => switchTab("interviewer")}
                    className={`py-2 px-5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all duration-200 ${activeTab === "interviewer"
                        ? "bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                        : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        }`}
                >
                    Interviewers



                </button>
            </div>

            {error && (
                <div className="py-3 px-4 bg-red-500/10 border border-red-500 rounded-lg mb-4">
                    <p className="text-red-400 m-0 text-sm"> {error}</p>
                </div>
            )}

            <div className="flex gap-4 mb-6 flex-wrap items-end">
                <div className="flex-1 min-w-[250px]">
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                        Search {tabLabel} Members
                    </label>
                    <SearchInput
                        placeholder="Search by name or email..."
                        onSearch={handleSearch}
                    />
                </div>
                <div className="min-w-[180px]">
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                        Filter by Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-[#0f172a] border border-slate-700 rounded-lg text-slate-200 text-sm cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors duration-200"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Loading State - only when no data yet (initial load / tab switch) */}
            {isLoading && allMembers.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-slate-400 text-base">Loading {tabLabel} members...</p>
                </div>
            )}

            {/* Table - always show when we have data, or when not loading (so header stays; only body data changes on pagination) */}
            {(!isLoading || allMembers.length > 0) && (
                <Table
                    columns={[
                        {
                            header: "Name",
                            render: (member) => (
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${activeTab === "hr"
                                        ? "bg-linear-to-br from-indigo-500 to-violet-500"
                                        : "bg-linear-to-br from-cyan-500 to-blue-500"
                                        }`}>
                                        {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                                    </div>
                                    <div className="font-semibold text-slate-200">{member.fullName}</div>
                                </div>
                            ),
                        },
                        {
                            header: "Email",
                            render: (member) => member.email,
                            cellClassName: "text-slate-400 text-[13px]",
                        },
                        {
                            header: "Status",
                            render: (member) => (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.3px] ${member.isActive
                                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                                    }`}>
                                    {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                            ),
                        },
                        {
                            header: "Created Date",
                            render: (member) => (
                                <span className="text-slate-400 text-[13px]">
                                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                                </span>
                            ),
                        },
                        {
                            header: "Actions",
                            render: (member) => (
                                <button
                                    className={`py-1 px-3 text-xs rounded-md font-semibold transition-all duration-200 ${member.isActive
                                        ? 'border border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                        : 'border border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                        } ${hasAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                    onClick={() => requestToggle(member)}
                                    disabled={!hasAccess}
                                >
                                    {member.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            ),
                        },
                    ]}
                    data={allMembers}
                    rowKey={(member) => member.id}
                    emptyMessage={`No ${tabLabel} members found.`}
                    emptySubMessage={
                        searchQuery
                            ? "Try adjusting your search or filters."
                            : `Click "Create ${tabLabel}" to add your first ${tabLabel.toLowerCase()} member.`
                    }
                />
            )}

            {/* Pagination - keep visible when total > 0 so header/layout don't jump */}
            {total > 0 && (
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

            {/* Create Member Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-[1000] p-5 backdrop-blur-[4px]"
                    onClick={closeCreateModal}
                >
                    <div
                        className="bg-[#0f172a] rounded-2xl max-w-[500px] w-full border border-slate-700 p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${activeTab === "hr"
                                    ? "bg-indigo-500/15 text-indigo-400"
                                    : "bg-cyan-500/15 text-cyan-400"
                                    }`}>

                                </div>
                                <h3 className="m-0 text-2xl text-slate-50 font-bold">
                                    Create {tabLabel} Account
                                </h3>
                            </div>
                            <p className="text-slate-400 text-sm mt-2 mb-0">
                                {activeTab === "hr"
                                    ? "Add a new HR member to manage recruitment and interviews."
                                    : "Add a new Interviewer to conduct and evaluate interviews."
                                }
                            </p>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="mb-4">
                                <label className="block text-slate-300 text-[13px] mb-1.5 font-semibold">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder={`Enter ${tabLabel.toLowerCase()} name`}
                                    value={newMember.name}
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                    required
                                    className="w-full py-2.5 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-200 box-border"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-slate-300 text-[13px] mb-1.5 font-semibold">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    placeholder={activeTab === "hr" ? "hr@company.com" : "interviewer@company.com"}
                                    value={newMember.email}
                                    onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                    required
                                    className="w-full py-2.5 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors duration-200 box-border"
                                />
                                <p className="text-slate-500 text-xs mt-1.5 mb-0">
                                    A temporary password will be sent to this email address.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="bg-slate-600 text-white border-none py-2.5 px-5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-500 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-none py-2.5 px-6 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Creating..." : `Create ${tabLabel} Account`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Toggle Status */}
            {memberToToggle && (
                <div
                    className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-[1000] p-5 backdrop-blur-[4px]"
                    onClick={cancelToggle}
                >
                    <div
                        className="bg-[#0f172a] rounded-2xl max-w-[450px] w-full border border-slate-700 p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <h3 className="m-0 text-[22px] text-slate-50 font-bold">
                                Confirm Action
                            </h3>
                            <p className="text-slate-400 text-[15px] mt-3 mb-0 leading-relaxed">
                                Are you sure you want to <strong className="text-slate-200">{memberToToggle.action}</strong> <strong className="text-slate-200">{memberToToggle.name}</strong>?
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={cancelToggle}
                                className="bg-slate-600 text-white border-none py-2.5 px-5 rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmToggle(memberToToggle, setMemberToToggle)}
                                className={`text-white border-none py-2.5 px-6 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90 transition-all duration-200 ${memberToToggle.action === 'deactivate'
                                    ? 'bg-linear-to-br from-red-500 to-red-600'
                                    : 'bg-linear-to-br from-emerald-500 to-emerald-600'
                                    }`}
                            >
                                {memberToToggle.action === 'deactivate' ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageHRPage;
