import { useState, useCallback } from "react";
import { useManageTeam } from "../../hooks/company/useManageTeam";
import { Table, SearchInput, Pagination } from "../../components/common";
import type { TeamMember } from "../../services/companyTeam.service";


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
    const [memberToToggle, setMemberToToggle] = useState<TeamMember | null>(null);


    const openCreateModal = useCallback(() => setShowCreateModal(true), []);
    const closeCreateModal = useCallback(() => setShowCreateModal(false), []);


    const requestToggle = useCallback((member: TeamMember) => {
        setMemberToToggle(member);
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
        <div className="mx-auto w-full min-w-0 max-md:overflow-x-hidden">
            {/* Header */}
            <header className="flex flex-wrap justify-between items-start gap-4 mb-6 max-md:mb-4">
                <div className="min-w-0 flex-1">
                    <h2 className="text-[22px] max-md:text-lg font-bold text-slate-100 m-0">Team Management</h2>
                    <p className="text-slate-400 mt-2 mb-0 text-sm max-md:text-xs">Create and manage HR and Interviewer accounts for your company.</p>
                </div>
                {hasAccess && (
                    <button
                        className="bg-linear-to-br from-indigo-500 to-violet-500 py-1.5 px-3.5 max-md:py-2 max-md:px-4 max-md:w-full max-md:text-sm text-[13px] font-semibold rounded-md border-none text-white cursor-pointer whitespace-nowrap w-fit h-fit shrink-0 hover:opacity-90 transition-all duration-200"
                        onClick={openCreateModal}
                    >
                        + Create {tabLabel}
                    </button>
                )}
            </header>

            <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl mb-6 max-md:mb-4 w-fit max-md:w-full border border-slate-700/50">
                <button
                    onClick={() => switchTab("hr")}
                    className={`py-2 px-5 max-md:flex-1 max-md:py-2.5 rounded-lg text-sm max-md:text-xs font-semibold border-none cursor-pointer transition-all duration-200 ${activeTab === "hr"
                        ? "bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
                        : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                        }`}
                >
                    HR Members
                </button>
                <button
                    onClick={() => switchTab("interviewer")}
                    className={`py-2 px-5 max-md:flex-1 max-md:py-2.5 rounded-lg text-sm max-md:text-xs font-semibold border-none cursor-pointer transition-all duration-200 ${activeTab === "interviewer"
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

            <div className="flex gap-4 max-md:gap-3 mb-6 max-md:mb-4 flex-wrap items-end max-md:flex-col max-md:items-stretch">
                <div className="flex-1 min-w-0 w-full max-md:min-w-0 max-md:w-full">
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                        Search {tabLabel} Members
                    </label>
                    <SearchInput
                        placeholder="Search by name or email..."
                        onSearch={handleSearch}
                    />
                </div>
                <div className="min-w-[180px] max-md:min-w-0 max-md:w-full max-md:relative">
                    <label className="block text-xs text-slate-400 mb-1.5 font-semibold">
                        Filter by Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-[#0f172a] border border-slate-700 rounded-lg text-slate-200 text-sm cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors duration-200 appearance-none pr-8 max-md:pr-10"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.6)' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                        }}
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

            {/* Mobile: card list */}
            <div className="md:hidden space-y-3">
                {allMembers.length === 0 ? (
                    <p className="text-slate-400 text-center py-8 text-sm">
                        {searchQuery
                            ? "Try adjusting your search or filters."
                            : `No ${tabLabel} members found. Click "Create ${tabLabel}" to add your first ${tabLabel.toLowerCase()} member.`}
                    </p>
                ) : (
                    allMembers.map((member) => (
                        <div
                            key={member.id}
                            className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-4"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${activeTab === "hr"
                                    ? "bg-linear-to-br from-indigo-500 to-violet-500"
                                    : "bg-linear-to-br from-cyan-500 to-blue-500"
                                    }`}>
                                    {member.fullName?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-slate-200 text-sm truncate">{member.fullName}</div>
                                    <div className="text-slate-400 text-xs truncate break-all">{member.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.3px] ${member.isActive
                                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                                    }`}>
                                    {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-slate-500 text-[11px]">
                                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                className={`w-full mt-3 py-2 px-3 text-xs rounded-md font-semibold transition-all duration-200 ${member.isActive
                                    ? 'border border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                    : 'border border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                    } ${hasAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                onClick={() => requestToggle(member)}
                                disabled={!hasAccess}
                            >
                                {member.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    ))
                )}
            </div>
            {/* Desktop: table */}
            <div className="hidden md:block">
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
            </div>

            {/* Pagination - keep visible when total > 0 so header/layout don't jump */}
            {total > 0 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                />
            )}

            {/* Create Member Modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-[1000] p-4 max-md:p-2 backdrop-blur-[4px]"
                    onClick={closeCreateModal}
                >
                    <div
                        className="bg-[#0f172a] rounded-2xl max-md:rounded-xl max-w-[500px] w-full max-md:max-w-[calc(100vw-1rem)] border border-slate-700 p-8 max-md:p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${activeTab === "hr"
                                    ? "bg-indigo-500/15 text-indigo-400"
                                    : "bg-cyan-500/15 text-cyan-400"
                                    }`}>

                                </div>
                                <h3 className="m-0 text-2xl max-md:text-lg text-slate-50 font-bold">
                                    Create {tabLabel} Account
                                </h3>
                            </div>
                            <p className="text-slate-400 text-sm max-md:text-xs mt-2 mb-0">
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

                            <div className="flex flex-wrap justify-end gap-3 max-md:gap-2 pt-4 border-t border-slate-700 max-md:flex-col">
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
                                    className="bg-slate-600 text-white border-none py-2.5 px-5 max-md:w-full rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-500 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-none py-2.5 px-6 max-md:w-full rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                    className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-[1000] p-4 max-md:p-2 backdrop-blur-[4px]"
                    onClick={cancelToggle}
                >
                    <div
                        className="bg-[#0f172a] rounded-2xl max-md:rounded-xl max-w-[450px] w-full max-md:max-w-[calc(100vw-1rem)] border border-slate-700 p-8 max-md:p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 max-md:mb-4">
                            <h3 className="m-0 text-[22px] max-md:text-lg text-slate-50 font-bold">
                                Confirm Action
                            </h3>
                            <p className="text-slate-400 text-[15px] max-md:text-sm mt-3 mb-0 leading-relaxed break-words">
                                Are you sure you want to <strong className="text-slate-200">{memberToToggle.isActive ? 'deactivate' : 'activate'}</strong> <strong className="text-slate-200">{memberToToggle.fullName}</strong>?
                            </p>
                        </div>

                        <div className="flex flex-wrap justify-end gap-3 max-md:gap-2 pt-4 border-t border-slate-700 max-md:flex-col">
                            <button
                                type="button"
                                onClick={cancelToggle}
                                className="bg-slate-600 text-white border-none py-2.5 px-5 max-md:w-full rounded-lg text-sm font-semibold cursor-pointer hover:bg-slate-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmToggle(memberToToggle, setMemberToToggle)}
                                className={`text-white border-none py-2.5 px-6 max-md:w-full rounded-lg text-sm font-semibold cursor-pointer hover:opacity-90 transition-all duration-200 ${memberToToggle.isActive
                                    ? 'bg-linear-to-br from-red-500 to-red-600'
                                    : 'bg-linear-to-br from-emerald-500 to-emerald-600'
                                    }`}
                            >
                                {memberToToggle.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageHRPage;
