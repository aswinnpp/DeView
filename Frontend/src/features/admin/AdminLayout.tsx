import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { SystemDataProvider } from "../../context/SystemDataContext";
import "./AdminLayout.css";

const AdminLayout = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifications = [
        { id: 1, text: "New company registration request", time: "5m ago" },
        { id: 2, text: "Subscription payment received", time: "1h ago" },
    ];

    return (
        <SystemDataProvider>
            <div className="admin-layout">
                {/* Header */}
                <header className="admin-layout__header">
                    <div className="admin-layout__brand">
                        <div className="admin-layout__logo">
                            A
                        </div>
                        <h2 className="admin-layout__title">
                            Admin Control Room
                        </h2>
                    </div>

                    <div className="admin-layout__actions">
                        <button
                            onClick={() => setShowNotifications((v) => !v)}
                            className="admin-layout__notification-btn"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {notifications.length > 0 && (
                                <span className="admin-layout__notification-badge">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="admin-layout__notification-dropdown">
                                <div className="admin-layout__notification-header">
                                    <h3 className="admin-layout__notification-title">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="admin-layout__notification-close"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="admin-layout__notification-list">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="admin-layout__notification-item">
                                            <div className="admin-layout__notification-dot" />
                                            <div>
                                                <div className="admin-layout__notification-text">{n.text}</div>
                                                <div className="admin-layout__notification-time">{n.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <div className="admin-layout__container">
                    {/* Sidebar */}
                    <aside className="admin-layout__sidebar">
                        <nav className="admin-layout__nav">
                            <NavLink
                                to="/admin"
                                end
                                className={({ isActive }) =>
                                    `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
                                }
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/admin/company-requests"
                                className={({ isActive }) =>
                                    `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
                                }
                            >
                                Company Requests
                            </NavLink>

                            <NavLink
                                to="/admin/companies"
                                className={({ isActive }) =>
                                    `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
                                }
                            >
                                Companies
                            </NavLink>

                            <NavLink
                                to="/admin/subscriptions"
                                className={({ isActive }) =>
                                    `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
                                }
                            >
                                Subscriptions
                            </NavLink>

                            <NavLink
                                to="/admin/candidates"
                                className={({ isActive }) =>
                                    `admin-layout__nav-link ${isActive ? 'admin-layout__nav-link--active' : ''}`
                                }
                            >
                                Candidates
                            </NavLink>
                        </nav>

                        {/* Logout Button - Always visible at bottom */}
                        <button
                            onClick={() => dispatch(logout())}
                            className="admin-layout__logout-btn"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </button>
                    </aside>

                    {/* Main Content Area */}
                    <main className="admin-layout__main">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SystemDataProvider>
    );
};

export default AdminLayout;
