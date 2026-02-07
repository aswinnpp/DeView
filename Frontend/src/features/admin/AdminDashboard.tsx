import React from "react";
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
import "./AdminDashboard.css";

const AdminDashboard: React.FC = () => {
    const {
        growthData,
        maxValue,
        registrationStatusData,
        subscriptionByPlanData,
        timePeriod,
        setTimePeriod,
        navigateToCompanyRequests,
        navigateToSubscriptions,
        tooltipStyle,
        timePeriodOptions,
    } = useAdminDashboard();

    return (
        <div className="admin-dashboard">

            <div className="admin-dashboard__header">
                <h1 className="admin-dashboard__title">
                    Admin Dashboard
                </h1>
                <p className="admin-dashboard__subtitle">
                    Welcome back! Here's an overview of your platform's activity
                </p>
            </div>

            {/* Quick Actions */}
            <div className="admin-dashboard__quick-actions">
                <button
                    onClick={navigateToCompanyRequests}
                    className="admin-dashboard__btn-primary"
                >
                    Company Requests
                </button>
                <button
                    onClick={navigateToSubscriptions}
                    className="admin-dashboard__btn-secondary"
                >
                    Subscriptions
                </button>
            </div>

            {/* Analytics Grid: Company Registrations & Subscriptions */}
            <div className="admin-dashboard__analytics-grid">
                {/* Company Registrations - Pie Chart */}
                <div className="admin-dashboard__chart-card">
                    <h3 className="admin-dashboard__chart-title">
                        Company Registrations
                    </h3>
                    <p className="admin-dashboard__chart-description">
                        Distribution of company approval statuses
                    </p>
                    <div className="admin-dashboard__chart-container">
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
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Legend
                                        wrapperStyle={{ color: '#94a3b8', fontSize: 12 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="admin-dashboard__no-data">
                                No registration data available yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Company Subscriptions - Bar Chart */}
                <div className="admin-dashboard__chart-card">
                    <h3 className="admin-dashboard__chart-title">
                        Company Subscriptions
                    </h3>
                    <p className="admin-dashboard__chart-description">
                        Number of companies on each subscription plan
                    </p>
                    <div className="admin-dashboard__chart-container">
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
                                    <Tooltip contentStyle={tooltipStyle} />
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
                            <div className="admin-dashboard__no-data">
                                No subscription data available yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Growth Chart (moved to bottom) */}
            <div className="admin-dashboard__growth-section">
                <div className="admin-dashboard__growth-header">
                    <div>
                        <h2 className="admin-dashboard__growth-title">
                            Company Growth Overview
                        </h2>
                        <p className="admin-dashboard__growth-subtitle">
                            New company registrations by time period
                        </p>
                    </div>
                    <div className="admin-dashboard__period-selector">
                        {timePeriodOptions.map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimePeriod(period)}
                                className={`admin-dashboard__period-btn ${timePeriod === period ? 'admin-dashboard__period-btn--active' : ''
                                    }`}
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="admin-dashboard__bar-chart">
                    {growthData.map((item, index) => {
                        const heightPercent = (item.count / maxValue) * 100;
                        const isLast = index === growthData.length - 1;

                        return (
                            <div key={index} className="admin-dashboard__bar-item">
                                <div className="admin-dashboard__bar-container">
                                    <div
                                        className={`admin-dashboard__bar ${isLast ? 'admin-dashboard__bar--current' : 'admin-dashboard__bar--previous'
                                            }`}
                                        style={{
                                            height: `${heightPercent}%`,
                                            minHeight: item.count > 0 ? '24px' : '4px'
                                        }}
                                        title={`${item.label}: ${item.count} companies`}
                                    >
                                        {item.count > 0 && (
                                            <div className="admin-dashboard__bar-value">
                                                {item.count}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className={`admin-dashboard__bar-label ${isLast ? 'admin-dashboard__bar-label--current' : ''
                                    }`}>
                                    {item.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="admin-dashboard__legend">
                    <div className="admin-dashboard__legend-item">
                        <div className="admin-dashboard__legend-color admin-dashboard__legend-color--current" />
                        <span className="admin-dashboard__legend-text">Current Period</span>
                    </div>
                    <div className="admin-dashboard__legend-item">
                        <div className="admin-dashboard__legend-color admin-dashboard__legend-color--previous" />
                        <span className="admin-dashboard__legend-text">Previous Periods</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
