import { useId } from 'react';

import { useRecruitmentDashboard } from '@/hooks/useRecruitmentDashboard';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    LineChart,
    Line,
} from 'recharts';

/** Recharts needs itemStyle/labelStyle — dark-on-dark tooltips are unreadable on pie charts. */
const CHART_TOOLTIP = {
    contentStyle: {
        backgroundColor: '#ffffff',
        border: '1px solid #1e293b',
        borderRadius: 8,
        color: '#0f172a',
    },
    itemStyle: { color: '#0f172a' },
    labelStyle: { color: '#0f172a' },
};

const APP_STATUS_COLORS: Record<string, string> = {
    Applied: '#3b82f6',
    Shortlisted: '#f59e0b',
    Interviewed: '#8b5cf6',
    Hired: '#10b981',
    Rejected: '#ef4444',
};

const INTERVIEW_STATUS_COLORS: Record<string, string> = {
    Scheduled: '#3b82f6',
    Completed: '#10b981',
    Cancelled: '#ef4444',
};

const CHART_H = 220;

const RecruitmentDashboardPage = () => {
    const { stats, loading, error } = useRecruitmentDashboard();
    const gradApps = `${useId().replace(/:/g, '')}-apps`;
    const gradMonthly = `${useId().replace(/:/g, '')}-monthly`;


    if (error) {
        return (
            <div className="max-w-[1400px] mx-auto w-full min-w-0">
                <p className="text-red-400 text-center py-16 m-0">{error}</p>
            </div>
        );
    }

    if (loading || !stats) {
        return (
            <div className="max-w-[1400px] mx-auto w-full min-w-0">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-slate-800 rounded-lg w-1/3" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-72 bg-slate-800 rounded-xl border border-slate-700" />
                        <div className="h-72 bg-slate-800 rounded-xl border border-slate-700" />
                    </div>
                </div>
            </div>
        );
    }

    const applicationStatusForChart = stats.applicationStatus.length
        ? stats.applicationStatus.map((s) => ({
              ...s,
              color: APP_STATUS_COLORS[s.name] ?? '#64748b',
          }))
        : [];

    const interviewStatusForChart = stats.interviewStatus.length
        ? stats.interviewStatus.map((s) => ({
              ...s,
              color: INTERVIEW_STATUS_COLORS[s.name] ?? '#64748b',
          }))
        : [];

    return (
        <div className="max-w-[1400px] mx-auto w-full min-w-0 max-md:px-0">
            <div className="mb-8 max-md:mb-6">
                <h1 className="m-0 text-[28px] max-md:text-[22px] text-[#f1f5f9]">
                    Welcome back
                </h1>
                <p className="mt-1 mb-0 text-[#94a3b8] text-sm max-md:text-xs">
                    Recruitment overview for your organization — applications and interviews from live data.
                </p>
            </div>

            <h2 className="text-xs font-semibold text-[#64748b] uppercase tracking-widest m-0 mb-3">
                Applications
            </h2>
            <div className="grid grid-cols-[1.5fr_1fr] max-md:grid-cols-1 gap-6 max-md:gap-4 mb-8 max-md:mb-6">
                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl max-md:rounded-lg p-6 max-md:p-4 min-h-[320px] max-md:min-h-[280px]">
                    <h3 className="m-0 mb-2 text-lg max-md:text-base text-[#f1f5f9]">
                        Applications over time
                    </h3>
                    <p className="m-0 mb-5 max-md:mb-4 text-[13px] max-md:text-xs text-[#64748b]">
                        Last 7 days (UTC), by application date
                    </p>
                    <div className="h-[240px] max-md:h-[200px] min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                            <AreaChart data={stats.applicationsOverTime}>
                                <defs>
                                    <linearGradient id={gradApps} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    {...CHART_TOOLTIP}
                                    labelFormatter={(_, payload) =>
                                        payload?.[0]?.payload?.dateLabel ?? ''
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#${gradApps})`}
                                    name="Applications"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl max-md:rounded-lg p-6 max-md:p-4 min-h-[320px] max-md:min-h-[280px]">
                    <h3 className="m-0 mb-2 text-lg max-md:text-base text-[#f1f5f9]">
                        Application status
                    </h3>
                    <p className="m-0 mb-5 max-md:mb-4 text-[13px] max-md:text-xs text-[#64748b]">
                        Pipeline distribution
                    </p>
                    <div className="h-[240px] max-md:h-[200px] min-w-0 w-full flex items-center justify-center">
                        {applicationStatusForChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                                <PieChart>
                                    <Pie
                                        data={applicationStatusForChart}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                    >
                                        {applicationStatusForChart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip {...CHART_TOOLTIP} />
                                    <Legend
                                        wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-[#64748b] text-sm m-0">No applications yet</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-xl max-md:rounded-lg p-6 max-md:p-4 mb-8 max-md:mb-6">
                <h3 className="m-0 mb-2 text-lg max-md:text-base text-[#f1f5f9]">
                    Applications by job
                </h3>
                <p className="m-0 mb-5 max-md:mb-4 text-[13px] max-md:text-xs text-[#64748b]">
                    Count per job posting
                </p>
                <div className="h-[240px] max-md:h-[200px] min-w-0 w-full overflow-x-auto">
                    {stats.applicationsByJob.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={200}>
                            <BarChart data={stats.applicationsByJob} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={11}
                                    width={120}
                                    tickLine={false}
                                />
                                <Tooltip {...CHART_TOOLTIP} />
                                <Bar
                                    dataKey="applications"
                                    fill="#6366f1"
                                    radius={[0, 4, 4, 0]}
                                    name="Applications"
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-[#64748b] text-sm">
                            No job application data yet
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-xs font-semibold text-[#64748b] uppercase tracking-widest m-0 mb-3">
                Interviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6">
                    <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">
                        Monthly interview trend
                    </h4>
                    <div style={{ height: CHART_H }} className="min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={CHART_H}>
                            <AreaChart data={stats.monthlyInterviews}>
                                <defs>
                                    <linearGradient id={gradMonthly} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} width={28} />
                                <Tooltip {...CHART_TOOLTIP} />
                                <Area
                                    type="monotone"
                                    dataKey="interviews"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill={`url(#${gradMonthly})`}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6">
                    <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">
                        Interview status
                    </h4>
                    <div style={{ height: CHART_H }} className="min-w-0 w-full flex items-center justify-center">
                        {interviewStatusForChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={CHART_H}>
                                <PieChart>
                                    <Pie
                                        data={interviewStatusForChart}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {interviewStatusForChart.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip {...CHART_TOOLTIP} />
                                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-slate-500 text-sm m-0">No interviews yet</p>
                        )}
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 md:col-span-2">
                    <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">
                        This week&apos;s scheduled interviews
                    </h4>
                    <div style={{ height: CHART_H }} className="min-w-0 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={CHART_H}>
                            <LineChart data={stats.weeklyInterviews}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} width={28} />
                                <Tooltip {...CHART_TOOLTIP} />
                                <Line
                                    type="monotone"
                                    dataKey="interviews"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 7, fill: '#10b981' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentDashboardPage;
