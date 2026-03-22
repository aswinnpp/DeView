
import { Button } from "../../components/common";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,

} from "recharts";
import { useAdminDashboard } from "../../hooks/admin";

const AdminDashboard = () => {
    const {
        growthData,
        maxValue,
        registrationStatusData,
        subscriptionByPlanData,
        timePeriod,
        setTimePeriod,
        chartTooltip,
        timePeriodOptions,
        loading,
        error,
    } = useAdminDashboard();

    if (error) {
        return (
            <div className="max-w-[1400px] mx-auto">
                <p className="text-red-400 text-center py-16 m-0">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-[1400px] mx-auto animate-pulse">
                <div className="h-9 bg-slate-800 rounded-lg w-48 mb-4" />
                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                    <div className="h-72 bg-slate-800 rounded-2xl border border-slate-700" />
                    <div className="h-72 bg-slate-800 rounded-2xl border border-slate-700" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto">

            <div className="mb-6 max-md:mb-5">
                <h1 className="m-0 text-[28px] max-md:text-[22px] text-[#f1f5f9] font-bold">
                    Admin Dashboard
                </h1>
                <p className="mt-2 mb-0 text-[#94a3b8] text-sm max-md:text-xs">
                    Welcome back! Here's an overview of your platform's activity
                </p>
            </div>



            {/* Analytics Grid: Company Registrations & Subscriptions */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 mt-6 mb-6 flex-wrap max-md:grid-cols-1">
                {/* Company Registrations - Pie Chart */}
                <div className="bg-linear-to-br from-[#1e293b] to-[#020617] border border-[#334155] rounded-2xl p-6 min-h-[300px]">
                    <h3 className="m-0 text-lg text-[#f1f5f9] mb-2">
                        Company Registrations
                    </h3>
                    <p className="m-0 text-[13px] text-[#64748b] mb-4">
                        Distribution of company approval statuses
                    </p>
                    <div className="h-60">
                        {registrationStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={registrationStatusData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                    >
                                        {registrationStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip {...chartTooltip} />
                                    <Legend
                                        wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[#64748b] text-[13px]">
                                No registration data available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Company Subscriptions - Bar Chart */}
                <div className="bg-linear-to-br from-[#1e293b] to-[#020617] border border-[#334155] rounded-2xl p-6 min-h-[300px]">
                    <h3 className="m-0 text-lg text-[#f1f5f9] mb-2">
                        Company Subscriptions
                    </h3>
                    <p className="m-0 text-[13px] text-[#64748b] mb-4">
                        Number of companies on each subscription plan
                    </p>
                    <div className="h-60">
                        {subscriptionByPlanData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subscriptionByPlanData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#64748b"
                                        fontSize={12}

                                    />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip {...chartTooltip} />
                                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                                    <Bar
                                        dataKey="companies"
                                        name="Companies"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[#64748b] text-[13px]">
                                No subscription data available yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Growth Chart (moved to bottom) */}
            <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-2xl p-7 mb-6">
                <div className="flex justify-between items-center mb-7 flex-wrap gap-4 max-md:flex-col max-md:items-start">
                    <div>
                        <h2 className="m-0 text-xl text-[#f1f5f9] font-semibold">
                            Company Growth Overview
                        </h2>
                        <p className="mt-1.5 mb-0 text-[#64748b] text-[13px]">
                            New company registrations by time period
                        </p>
                    </div>
                    <div className="flex bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-1 gap-1">
                        {timePeriodOptions.map((period) => (
                            <Button
                                key={period}
                                variant={timePeriod === period ? 'primary' : 'secondary'}
                                onClick={() => setTimePeriod(period)}
                                className={`text-[13px] font-semibold py-2 px-4 rounded-lg capitalize ${timePeriod !== period ? '!bg-transparent !text-[#94a3b8] border-none' : 'border-none'}`}
                            >
                                {period}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end gap-2 max-md:gap-1 h-60 py-6 border-t border-[rgba(255,255,255,0.05)] overflow-x-auto">
                    {growthData.map((item, index) => {
                        const heightPercent = (item.count / maxValue) * 100;
                        const isLast = index === growthData.length - 1;

                        return (
                            <div key={index} className="flex-1 min-w-[44px] max-md:min-w-[36px] flex flex-col items-center gap-3">
                                <div className="w-full h-[200px] flex items-end justify-center">
                                    <div
                                        className={`w-[70%] max-md:w-[60%] rounded-t-lg relative transition-all duration-300 cursor-pointer hover:scale-y-105 ${isLast
                                            ? 'bg-linear-to-b from-[#6366f1] to-[#4f46e5]'
                                            : 'bg-linear-to-b from-[#475569] to-[#334155]'
                                            } hover:bg-linear-to-b hover:from-[#6366f1] hover:to-[#4f46e5]`}
                                        style={{
                                            height: `${heightPercent}%`,
                                            minHeight: item.count > 0 ? '24px' : '4px'
                                        }}
                                        title={`${item.label}: ${item.count} companies`}
                                    >
                                        {item.count > 0 && (
                                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[#e2e8f0] text-[13px] font-bold bg-[rgba(0,0,0,0.5)] py-1 px-2.5 rounded-md whitespace-nowrap">
                                                {item.count}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`text-xs font-medium text-center ${isLast ? 'text-[#6366f1] font-semibold' : 'text-[#64748b]'
                                    }`}>
                                    {item.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-5 pt-5 border-t border-[rgba(255,255,255,0.05)] flex flex-wrap justify-end gap-4 max-md:gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-linear-to-b from-[#6366f1] to-[#4f46e5]" />
                        <span className="text-[#94a3b8]">Current Period</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-linear-to-b from-[#475569] to-[#334155]" />
                        <span className="text-[#94a3b8]">Previous Periods</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
