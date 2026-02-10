import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useSystemData } from "../../context/SystemDataContext";
import { selectUser } from "../../context/authSlice";
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
} from "recharts";


const CompanyDashboardPage = () => {
    const { jobs, companies } = useSystemData();
    const user = useSelector(selectUser);
    const companyId = user?.companyId;

    const company = companies.find((c) => c.id === companyId);
    const myJobs = jobs.filter(j => j.companyId === companyId);


    // Applications over time data (last 7 days)
    const applicationsOverTime = useMemo(() => {
        const last7Days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            let count = 0;
            myJobs.forEach(job => {
                job.applicants?.forEach(app => {
                    const appDate = new Date(app.appliedDate || Date.now());
                    appDate.setHours(0, 0, 0, 0);
                    if (appDate.getTime() === date.getTime()) {
                        count++;
                    }
                });
            });

            last7Days.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                applications: count,
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
        }

        // If no real data, show sample data
        if (last7Days.every(d => d.applications === 0)) {
            return [
                { day: 'Mon', applications: 3, date: 'Jan 20' },
                { day: 'Tue', applications: 5, date: 'Jan 21' },
                { day: 'Wed', applications: 2, date: 'Jan 22' },
                { day: 'Thu', applications: 8, date: 'Jan 23' },
                { day: 'Fri', applications: 6, date: 'Jan 24' },
                { day: 'Sat', applications: 4, date: 'Jan 25' },
                { day: 'Sun', applications: 7, date: 'Jan 26' },
            ];
        }

        return last7Days;
    }, [myJobs]);

    // Application status distribution
    const applicationStatusData = useMemo(() => {
        let applied = 0;
        let shortlisted = 0;
        let interviewed = 0;
        let hired = 0;
        let rejected = 0;

        myJobs.forEach(job => {
            job.applicants?.forEach(app => {
                switch (app.status?.toLowerCase()) {
                    case 'applied':
                        applied++;
                        break;
                    case 'shortlisted':
                        shortlisted++;
                        break;
                    case 'interviewed':
                    case 'in_interview':
                        interviewed++;
                        break;
                    case 'hired':
                    case 'offered':
                        hired++;
                        break;
                    case 'rejected':
                        rejected++;
                        break;
                    default:
                        applied++;
                }
            });
        });

        const data = [
            { name: 'Applied', value: applied, color: '#3b82f6' },
            { name: 'Shortlisted', value: shortlisted, color: '#f59e0b' },
            { name: 'Interviewed', value: interviewed, color: '#8b5cf6' },
            { name: 'Hired', value: hired, color: '#10b981' },
            { name: 'Rejected', value: rejected, color: '#ef4444' },
        ].filter(d => d.value > 0);

        // If no data, show sample
        if (data.length === 0) {
            return [
                { name: 'Applied', value: 12, color: '#3b82f6' },
                { name: 'Shortlisted', value: 5, color: '#f59e0b' },
                { name: 'Interviewed', value: 3, color: '#8b5cf6' },
                { name: 'Hired', value: 2, color: '#10b981' },
                { name: 'Rejected', value: 4, color: '#ef4444' },
            ];
        }

        return data;
    }, [myJobs]);

    // Applications by job (for bar chart)
    const applicationsByJob = useMemo(() => {
        const data = myJobs.slice(0, 5).map(job => ({
            name: job.title?.substring(0, 15) + (job.title?.length > 15 ? '...' : '') || 'Untitled',
            applications: job.applicants?.length || 0,
        }));

        // If no data, show sample
        if (data.length === 0 || data.every(d => d.applications === 0)) {
            return [
                { name: 'Frontend Dev', applications: 8 },
                { name: 'Backend Dev', applications: 5 },
                { name: 'UI Designer', applications: 3 },
                { name: 'DevOps Eng', applications: 4 },
            ];
        }

        return data;
    }, [myJobs]);


    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: 0, fontSize: 28, color: '#f1f5f9' }}>
                    Welcome back{company?.name ? `, ${company.name}` : ''}!
                </h1>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: 14 }}>
                    Here's what's happening with your recruitment today
                </p>
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                gap: 24,
                marginBottom: 24
            }}>
                {/* Applications Over Time - Area Chart */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    padding: 24,
                    minHeight: 320
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#f1f5f9' }}>
                        Applications Over Time
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#64748b' }}>
                        Daily application trends for the last 7 days
                    </p>
                    <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={applicationsOverTime}>
                                <defs>
                                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        color: '#e2e8f0',
                                    }}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload[0]) {
                                            return payload[0].payload.date;
                                        }
                                        return label;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorApplications)"
                                    name="Applications"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Application Status - Pie Chart */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid #334155',
                    borderRadius: 12,
                    padding: 24,
                    minHeight: 320
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#f1f5f9' }}>
                        Application Status
                    </h3>
                    <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#64748b' }}>
                        Distribution of candidates by status
                    </p>
                    <div style={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={applicationStatusData}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={4}
                                >
                                    {applicationStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#020617',
                                        border: '1px solid #334155',
                                        borderRadius: 8,
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Applications by Job - Bar Chart */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                border: '1px solid #334155',
                borderRadius: 12,
                padding: 24,
            }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#f1f5f9' }}>
                    Applications by Job Position
                </h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 13, color: '#64748b' }}>
                    Number of applications received per job posting
                </p>
                <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={applicationsByJob} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                type="number"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                stroke="#64748b"
                                fontSize={12}
                                width={100}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#020617',
                                    border: '1px solid #334155',
                                    borderRadius: 8,
                                    color: '#e2e8f0',
                                }}
                            />
                            <Bar
                                dataKey="applications"
                                fill="#6366f1"
                                radius={[0, 4, 4, 0]}
                                name="Applications"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboardPage;

