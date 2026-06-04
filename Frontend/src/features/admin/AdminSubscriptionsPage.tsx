import { useState } from "react";
import { Button, Input, SearchInput, Table, Pagination } from "../../components/common";
import { useAdminSubscriptions } from "../../hooks/admin";

const AdminSubscriptionsPage = () => {
    const [editingPlan, setEditingPlan] = useState(false);
    const [confirmToggleId, setConfirmToggleId] = useState<string | null>(null);

    const {
        form,
        onSubmit,
        plans,
        total,
        page,
        totalPages,
        sortOrder,
        status,
        duration,
        isLoading,
        error,
        handleSearch,
        handleSortOrder,
        setStatusFilter,
        setDurationFilter,
        goToPage,
        actionLoading,
        toggleSubscriptionStatus,
        startCreate,
        startEdit,
        isEditing,
    } = useAdminSubscriptions(() => setEditingPlan(false));
    const {
        register,
        handleSubmit,
        watch,
        setValue,
    } = form;

    const jobUnlimited = watch("jobUnlimited");
    const interviewUnlimited = watch("interviewUnlimited");
    return (
        <div className="max-w-[1400px] mx-auto w-full min-w-0 px-3 py-5 sm:px-4 sm:py-6">
            <header className="mb-6 max-md:mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="m-0 text-[28px] max-md:text-[22px] font-bold text-slate-50">
                        Subscription Plans
                    </h1>
                    <p className="mt-2 mb-0 text-sm max-md:text-xs text-slate-400">
                        Create and manage subscription plans for companies.
                    </p>
                </div>
                <Button
                    type="button"
                    className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm border-none bg-gradient-to-br from-indigo-500 to-indigo-600"
                    onClick={() => {
                        startCreate();
                        setEditingPlan(true);
                    }}
                >
                    + Create Plan
                </Button>
            </header>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-3 sm:gap-4 mb-6">
                <div className="flex-1 min-w-0 w-full max-md:min-w-0">
                    <SearchInput
                        placeholder="Search by plan name or price..."
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
                            setStatusFilter(
                                (e.target.value || undefined) as typeof status
                            )
                        }
                        className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-lg text-[13px] text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    >
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
                <div className="min-w-0">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Duration
                    </label>
                    <select
                        value={duration ?? ""}
                        onChange={(e) =>
                            setDurationFilter(
                                (e.target.value || undefined) as typeof duration
                            )
                        }
                        className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-lg text-[13px] text-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
                    >
                        <option value="">All</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annual">Annual</option>
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

            <div className="hidden md:block mb-6 relative">
                <Table
                    data={plans}
                    rowKey={(p) => p.id}
                    columns={[
                        {
                            header: "Plan",
                            render: (p) => (
                                <div className="min-w-0">
                                    <div className="truncate text-[15px] font-semibold text-slate-50">
                                        {p.name}
                                    </div>
                                    <div className="text-[12px] text-slate-400">
                                        Created {new Date(p.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: "Price",
                            render: (p) => (
                                <span className="text-base font-bold text-emerald-500">
                                    ₹{p.price}
                                </span>
                            ),
                        },
                        {
                            header: "Duration",
                            render: (p) => (
                                <span className="inline-flex rounded text-xs font-semibold bg-slate-700 px-2 py-1 text-slate-100">
                                    {p.duration}
                                </span>
                            ),
                        },
                        {
                            header: "Limits",
                            render: (p) => (
                                <div className="text-[13px] text-slate-300">
                                    <div>
                                        Jobs:{" "}
                                        <span className="text-slate-100 font-semibold">
                                            {p.jobUnlimited ? "Unlimited" : p.jobPostLimit}
                                        </span>
                                    </div>
                                    <div>
                                        Interviews:{" "}
                                        <span className="text-slate-100 font-semibold">
                                            {p.interviewUnlimited ? "Unlimited" : p.interviewLimit}
                                        </span>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            header: "AI",
                            render: (p) => (
                                <span className="text-[13px] font-semibold text-slate-100">
                                    {p.hasAI ? "Enabled" : "—"}
                                </span>
                            ),
                        },
                        {
                            header: "Actions",
                            render: (p) => (
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        disabled={actionLoading}
                                        className="rounded-lg px-3 py-1.5 text-xs font-semibold border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                        onClick={() => {
                                            startEdit(p);
                                            setEditingPlan(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        disabled={actionLoading}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold border-none ${
                                            p.isActive
                                                ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                                                : "bg-emerald-500 text-white hover:bg-emerald-600"
                                        }`}
                                        onClick={() => setConfirmToggleId(p.id)}
                                    >
                                        {p.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    emptyMessage={isLoading ? "" : "No subscription plans found."}
                />

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                        <span className="text-slate-300 text-sm">
                            Loading subscription plans...
                        </span>
                    </div>
                )}
            </div>

            <div className="md:hidden mb-6 space-y-3">
                {isLoading ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-300">
                        Loading subscription plans...
                    </div>
                ) : plans.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-8 text-center text-sm text-slate-300">
                        No subscription plans found.
                    </div>
                ) : (
                    plans.map((p) => (
                        <div
                            key={p.id}
                            className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="m-0 truncate text-sm font-semibold text-slate-100">{p.name}</h3>
                                    <p className="m-0 mt-1 text-xs text-slate-400">
                                        Created {new Date(p.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="text-base font-bold text-emerald-500">₹{p.price}</span>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Duration</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">{p.duration}</p>
                                </div>
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">AI</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">{p.hasAI ? "Enabled" : "—"}</p>
                                </div>
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Job limit</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">
                                        {p.jobUnlimited ? "Unlimited" : p.jobPostLimit}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2">
                                    <p className="m-0 text-slate-400">Interview limit</p>
                                    <p className="m-0 mt-1 font-semibold text-slate-100">
                                        {p.interviewUnlimited ? "Unlimited" : p.interviewLimit}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <Button
                                    type="button"
                                    disabled={actionLoading}
                                    className="flex-1 rounded-lg px-3 py-2 text-xs font-semibold border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
                                    onClick={() => {
                                        startEdit(p);
                                        setEditingPlan(true);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    type="button"
                                    disabled={actionLoading}
                                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold border-none ${
                                        p.isActive
                                            ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                                            : "bg-emerald-500 text-white hover:bg-emerald-600"
                                    }`}
                                    onClick={() => setConfirmToggleId(p.id)}
                                >
                                    {p.isActive ? "Deactivate" : "Activate"}
                                </Button>
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
                />
            )}


            {/* Create/Edit Modal */}
            {editingPlan && (
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-5"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 px-6 py-8 sm:px-8">
                        <div className="mb-6">
                            <h3 className="text-[22px] font-semibold text-slate-100">
                                {isEditing ? "Edit Plan" : "Create New Plan"}
                            </h3>
                            <button
                                className="absolute right-6 top-6 text-2xl text-slate-400 transition hover:text-slate-100"
                                onClick={() => setEditingPlan(false)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Plan Name *"
                                {...register("name")}
                                placeholder="e.g., Starter, Pro, Enterprise"
                                required
                                wrapperClassName="block"
                                labelClassName="mb-1.5 block text-[13px] font-semibold text-slate-400"
                                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-500"
                            />
                            <Input
                                label="Price *"
                                type="number"
                                {...register("price")}
                                placeholder="e.g 499,999"
                                required
                                wrapperClassName="block"
                                labelClassName="mb-1.5 block text-[13px] font-semibold text-slate-400"
                                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-500"
                            />
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-[13px] font-semibold text-slate-400">
                                        Duration
                                    </span>
                                    <select
                                        {...register("duration")}
                                        className="w-full cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 focus:border-indigo-500"
                                    >
                                        <option value="Monthly">Monthly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Annual">Annual</option>
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-[13px] font-semibold text-slate-400">
                                        Active
                                    </span>
                                    <label className="inline-flex items-center gap-2 text-[13px] text-slate-100">
                                        <input
                                            type="checkbox"
                                            {...register("isActive")}
                                            className="h-4 w-4 rounded border border-slate-500 bg-slate-900"
                                        />
                                        <span>Plan is active</span>
                                    </label>
                                </label>
                            </div>
                            {/* Plan limits & feature flags */}
                            <div className="mt-2 space-y-3">
                                <h4 className="text-sm font-semibold text-slate-100">
                                    Plan Limits & Features
                                </h4>
                                <p className="text-[12px] text-slate-500">
                                    Define how many jobs and interviews this plan includes, and toggle AI options.
                                </p>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-1.5 block text-[13px] font-semibold text-slate-400">
                                            Number of job posts
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                {...register("jobPostLimit")}
                                                placeholder="e.g., 10"
                                                disabled={jobUnlimited}
                                                wrapperClassName="flex-1"
                                                className={`w-full rounded-md border border-slate-700 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 ${jobUnlimited ? "bg-slate-950 opacity-50" : "bg-slate-950"} `}
                                            />
                                            <label className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-slate-100">
                                                <input
                                                    type="checkbox"
                                                    {...register("jobUnlimited")}
                                                    onChange={(e) => {
                                                        register("jobUnlimited").onChange(e);
                                                        if (e.target.checked) {
                                                            setValue("jobPostLimit", 0);
                                                        }
                                                    }}
                                                    className="h-[14px] w-[14px] rounded border border-slate-500 bg-slate-900"
                                                />
                                                <span>Unlimited</span>
                                            </label>
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-[13px] font-semibold text-slate-400">
                                            Number of interviews
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min={0}
                                                {...register("interviewLimit")}
                                                placeholder="e.g., 50"
                                                disabled={interviewUnlimited}
                                                wrapperClassName="flex-1"
                                                className={`w-full rounded-md border border-slate-700 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 ${interviewUnlimited ? "bg-slate-950 opacity-50" : "bg-slate-950"} `}
                                            />
                                            <label className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-slate-100">
                                                <input
                                                    type="checkbox"
                                                    {...register("interviewUnlimited")}
                                                    onChange={(e) => {
                                                        register("interviewUnlimited").onChange(e);
                                                        if (e.target.checked) {
                                                            setValue("interviewLimit", 0);
                                                        }
                                                    }}
                                                    className="h-[14px] w-[14px] rounded border border-slate-500 bg-slate-900"
                                                />
                                                <span>Unlimited</span>
                                            </label>
                                        </div>
                                    </label>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <label className="inline-flex items-center gap-2 text-[13px] text-slate-100">
                                        <input
                                            type="checkbox"
                                            {...register("hasAI")}
                                            className="h-4 w-4 rounded border border-slate-500 bg-slate-900"
                                        />
                                        <span>AI features (shortlisting, recommendations, etc.)</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="inline-flex items-center rounded-lg border border-slate-600 bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600"
                                    onClick={() => setEditingPlan(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 border-none"
                                >
                                   {isEditing ? "Save Changes" : "Create Plan"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle confirmation modal */}
            {confirmToggleId && (
                <div
                    className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 px-5"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-[420px] rounded-xl border border-slate-700 bg-slate-800 px-6 py-6">
                        <h3 className="text-lg font-semibold text-slate-100 mb-2">
                            {(() => {
                                const plan = plans.find((p) => p.id === confirmToggleId);
                                return plan?.isActive ? "Deactivate plan?" : "Activate plan?";
                            })()}
                        </h3>
                        <p className="text-sm text-slate-300 mb-5">
                            This will {(() => {
                                const plan = plans.find((p) => p.id === confirmToggleId);
                                return plan?.isActive ? "disable" : "enable";
                            })()} the selected subscription plan for companies. You can change this again later.
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                className="px-4 py-2 text-sm"
                                onClick={() => setConfirmToggleId(null)}
                                disabled={actionLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 border-none"
                                disabled={actionLoading}
                                onClick={async () => {
                                    if (!confirmToggleId) return;
                                    await toggleSubscriptionStatus(confirmToggleId);
                                    setConfirmToggleId(null);
                                }}
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AdminSubscriptionsPage;
