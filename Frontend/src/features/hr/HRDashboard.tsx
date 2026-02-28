import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/context/store';
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
  LineChart,
  Line,
  Legend,
} from 'recharts';

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 8,
  color: '#e2e8f0',
  fontSize: 12,
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const emptyMonthly = MONTHS.map(month => ({ month, interviews: 0 }));
const emptyWeekly  = DAYS.map(day => ({ day, interviews: 0 }));
const emptyStatus  = [
  { name: 'Scheduled', value: 0, color: '#3b82f6' },
  { name: 'Completed', value: 0, color: '#10b981' },
  { name: 'Cancelled', value: 0, color: '#ef4444' },
];

const CHART_H = 200;

const HRDashboard = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const today = useMemo(() =>
    new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }), []);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-700">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 m-0">HR Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1 m-0">
            Welcome back{user?.fullName ? `, ${user.fullName}` : ''}! Here's your recruitment overview.
          </p>
        </div>
        <div className="text-xs md:text-sm text-slate-500 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-lg self-start sm:self-auto whitespace-nowrap">
          {today}
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest m-0">
          Analytics Overview
        </h3>

        {/* 1 col on mobile → 2 cols on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Monthly Trend – Area */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 hover:border-slate-600 transition-colors">
            <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">Monthly Interview Trend</h4>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <AreaChart data={emptyMonthly}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" fontSize={11} width={28} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="interviews" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Interview Status – Pie */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 hover:border-slate-600 transition-colors">
            <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">Interview Status</h4>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <PieChart>
                <Pie
                  data={emptyStatus}
                  cx="50%" cy="45%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {emptyStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Activity – Line */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 hover:border-slate-600 transition-colors">
            <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">This Week's Activity</h4>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <LineChart data={emptyWeekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} width={28} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
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

          {/* Applications by Job – placeholder */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 md:p-6 hover:border-slate-600 transition-colors">
            <h4 className="text-sm md:text-base font-semibold text-slate-100 m-0 mb-4">Applications by Job</h4>
            <div className="flex items-center justify-center text-slate-500 text-sm" style={{ height: CHART_H }}>
              No job data available
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default HRDashboard;
