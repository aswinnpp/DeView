import { SearchInput, Table, Pagination } from "../../components/common";
import { useAdminSubscriptionHistory } from "../../hooks/admin";

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        Pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        Expired: "bg-slate-600/30 text-slate-400 border-slate-600/40",
    };
    const cls = map[status] ?? "bg-slate-700 text-slate-300 border-slate-600";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}
        >
            <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                    status === "Active"
                        ? "bg-emerald-400"
                        : status === "Pending"
                        ? "bg-amber-400"
                        : "bg-slate-500"
                }`}
            />
            {status}
        </span>
    );
};

const fmtDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const AdminSubscriptionHistoryPage = () => {
    const {
        rows,
        total,
        page,
        totalPages,
        status,
        sortOrder,
        isLoading,
        error,
        handleSearch,
        handleStatusFilter,
        handleSortOrder,
        goToPage,
    } = useAdminSubscriptionHistory();

    return (
        <div className="max-w-[1400px] mx-auto w-full min-w-0 px-3 py-5 sm:px-4 sm:py-6">
            <header className="mb-6 max-md:mb-5">
                <h1 className="m-0 text-[28px] max-md:text-[22px] font-bold text-slate-50">
                    Subscription History
                </h1>
                <p className="mt-2 mb-0 text-sm max-md:text-xs text-slate-400">
                    View all subscription records across companies — active, pending, and expired.
                </p>
            </header>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-end gap-3 sm:gap-4 mb-6">
                <div className="flex-1 min-w-0 w-full">
                    <SearchInput
                        placeholder="Search by company or plan name..."
                        onSearch={handleSearch}
                    />
                </div>
                <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Status
                    </label>
                    <select
                        value={status ?? ""}
                        onChange={(e) =>
                            handleStatusFilter(
                                (e.target.value || undefined) as typeof status
                            )
                        }
                        className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-lg text-[13px] text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    >
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
                <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Sort
                    </label>
                    <select
                        value={sortOrder}
                        onChange={(e) =>
                            handleSortOrder(e.target.value as "asc" | "desc")
                        }
                        className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-lg text-[13px] text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    >
                        <option value="desc">Newest first</option>
                        <option value="asc">Oldest first</option>
                    </select>
                </div>
            </div>

            {!!error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* Desktop Table */}
            <div className="hidden md:block mb-6 relative">
                <Table
                    data={rows}
                    rowKey={(r) => r.subscriptionId || `${r.companyId}-${r.startAt}`}
                    columns={[
                        {
                            header: "Company",
                            render: (r) => (
                                <span className="text-[15px] font-semibold text-slate-50 truncate block max-w-[200px]">
                                    {r.companyName}
                                </span>
                            ),
                        },
                        {
                            header: "Plan",
                            render: (r) => (
                                <div className="min-w-0">
                                    <div className="truncate text-[14px] font-medium text-slate-100">
                                        {r.planName}
                                    </div>
                                    <div className="text-[12px] text-slate-400">
                                        {r.duration}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: "Amount",
                            render: (r) => (
                                <span className="text-base font-bold text-emerald-400">
                                    ₹{r.price.toLocaleString("en-IN")}
                                </span>
                            ),
                        },
                        {
                            header: "Start Date",
                            render: (r) => (
                                <span className="text-sm text-slate-200">
                                    {fmtDate(r.startAt)}
                                </span>
                            ),
                        },
                        {
                            header: "Expiry Date",
                            render: (r) => (
                                <span className="text-sm text-slate-200">
                                    {fmtDate(r.endsAt)}
                                </span>
                            ),
                        },
                        {
                            header: "Status",
                            render: (r) => statusBadge(r.status),
                        },
                    ]}
                    emptyMessage={isLoading ? "" : "No subscription records found."}
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 rounded-xl">
                        <span className="text-slate-300 text-sm">
                            Loading subscription history...
                        </span>
                    </div>
                )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden mb-6 space-y-3">
                {isLoading ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-300">
                        Loading subscription history...
                    </div>
                ) : rows.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-300">
                        No subscription records found.
                    </div>
                ) : (
                    rows.map((r) => (
                        <div
                            key={r.subscriptionId || `${r.companyId}-${r.startAt}`}
                            className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="min-w-0">
                                    <h3 className="m-0 truncate text-sm font-semibold text-slate-100">
                                        {r.companyName}
                                    </h3>
                                    <p className="m-0 mt-1 text-xs text-slate-400">
                                        {r.planName} · {r.duration}
                                    </p>
                                </div>
                                {statusBadge(r.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Amount</p>
                                    <p className="m-0 mt-1 font-bold text-emerald-400">
                                        ₹{r.price.toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Duration</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">
                                        {r.duration}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Start</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">
                                        {fmtDate(r.startAt)}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Expiry</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">
                                        {fmtDate(r.endsAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {total > 0 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    leftContent={
                        <span>
                            Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of{" "}
                            {total} records
                        </span>
                    }
                />
            )}
        </div>
    );
};

export default AdminSubscriptionHistoryPage;
