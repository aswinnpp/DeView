import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { APP_ROUTES } from "../../constants/routes";
import { Button, NotificationBell } from "../../components/common";
import { useNotifications } from "../../hooks/notifications/useNotifications";
import { useLogout } from "../../hooks/auth/useLogout";

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { logout: handleLogout } = useLogout();
    const user = useSelector((state: RootState) => state.auth.user);
    const { notifications, unreadCount, markRead, formatTime, refresh } = useNotifications("admin");

    const role = (user?.role || "").toLowerCase();

    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    useEffect(() => {
        if (!showNotifications) return;
        refresh().catch(() => {});
    }, [showNotifications, refresh]);

    const navLinkClass = (isActive: boolean) =>
        `text-[#94a3b8] text-sm font-semibold rounded-[10px] py-3 px-3.5 no-underline flex items-center gap-2.5 transition-all duration-200 ${isActive
            ? 'text-white bg-linear-to-br from-[#6366f1] to-[#4f46e5]'
            : 'bg-transparent hover:text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)]'
        }`;

    if (!user) {
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }

    if (role !== "admin") {
        switch (role) {
            case "candidate":
                return <Navigate to="/candidate" replace />;
            case "company":
                return <Navigate to={APP_ROUTES.COMPANY_DASHBOARD} replace />;
            case "hr":
                return <Navigate to={APP_ROUTES.HR_DASHBOARD} replace />;
            case "interviewer":
                return <Navigate to={APP_ROUTES.INTERVIEWER_ASSIGNMENTS} replace />;
            default:
                return <Navigate to={APP_ROUTES.ROOT} replace />;
        }
    }

    return (
            <div className="min-h-screen bg-linear-to-br from-[#0f172a] to-[#1e1b4b] text-[#e5e7eb]">
                {/* Header */}
                <header className="flex justify-between items-center py-4 px-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(15,23,42,0.8)] backdrop-blur-[10px] sticky top-0 z-[100] max-md:py-3 max-md:px-4">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu toggle - visible only on md and below */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSidebarOpen((o) => !o)}
                            className="md:hidden !bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[10px] p-2.5 text-[#e5e7eb] flex items-center justify-center"
                            aria-label="Toggle menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </Button>
                       
                        <h2 className="text-[#e5e7eb] m-0 text-xl font-semibold max-md:text-base truncate">
                            Admin Control Room
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        <div className="relative">
                            <NotificationBell
                                className="!bg-none !border-none cursor-pointer text-xl text-[rgba(255,255,255,0.95)] relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)]"
                                onClick={() => setShowNotifications((v) => !v)}
                                count={unreadCount}
                            />
                            {showNotifications && (
                                <div className="absolute top-[110%] right-0 w-80 max-w-[calc(100vw-2rem)] bg-[rgba(12,12,18,0.98)] border border-[rgba(255,255,255,0.03)] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-[2000]">
                                    <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.04)]">
                                        <h3 className="m-0 text-white text-[15px]">Notifications</h3>
                                        <Button variant="secondary" className="!bg-none !border-none text-[rgba(255,255,255,0.7)] cursor-pointer" onClick={() => setShowNotifications(false)}>✕</Button>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="py-6 text-center text-[#94a3b8] text-sm">
                                                No notifications yet
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <button
                                                    key={n.id}
                                                    type="button"
                                                    className="w-full text-left flex items-start gap-3 p-4 border-none border-b border-[rgba(255,255,255,0.03)] bg-transparent hover:bg-[rgba(255,255,255,0.02)] cursor-pointer"
                                                    onClick={() => markRead(n.id)}
                                                >
                                                    <div className="min-w-0">
                                                        <div className="text-white text-sm whitespace-pre-wrap break-words">
                                                            {n.message || n.title}
                                                        </div>
                                                        <div className="text-[rgba(255,255,255,0.5)] text-xs mt-1">{formatTime(n.createdAt)}</div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[150] md:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Main Content */}
                <div className="grid grid-cols-[240px_1fr] min-h-[calc(100vh-77px)] max-md:grid-cols-1">
                    {/* Desktop Sidebar - hidden on mobile */}
                    <aside className="bg-[rgba(255,255,255,0.02)] border-r border-[rgba(255,255,255,0.06)] py-5 px-4 flex flex-col h-[calc(100vh-77px)] sticky top-[77px] max-md:hidden">
                        <nav className="flex flex-col gap-2 flex-1">
                            <NavLink
                                to="/admin"
                                end
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/admin/company-requests"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Company Requests
                            </NavLink>

                            <NavLink
                                to="/admin/companies"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Companies
                            </NavLink>

                            <NavLink
                                to="/admin/subscriptions"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Subscriptions
                            </NavLink>

                            <NavLink
                                to="/admin/subscription-history"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Subscription History
                            </NavLink>

                            <NavLink
                                to="/admin/candidates"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Candidates
                            </NavLink>
                        </nav>

                        <Button
                            variant="danger"
                            onClick={() => handleLogout()}
                            className="mt-auto rounded-[10px] py-3 px-3.5 font-semibold text-sm flex items-center justify-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </Button>
                    </aside>

                    {/* Mobile Sidebar - overlay when open */}
                    <aside
                        className={`fixed top-0 left-0 z-[200] h-full w-[240px] max-w-[85vw] bg-[rgba(15,23,42,0.98)] border-r border-[rgba(255,255,255,0.06)] py-5 px-4 flex flex-col shadow-xl transition-transform duration-200 ease-out md:hidden ${
                            sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4 px-1">
                            <span className="text-[#e5e7eb] font-semibold text-sm">Menu</span>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSidebarOpen(false)}
                                className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.08)] p-2 rounded-lg text-[#94a3b8]"
                                aria-label="Close menu"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </Button>
                        </div>
                        <nav className="flex flex-col gap-2 flex-1" onClick={() => setSidebarOpen(false)}>
                            <NavLink
                                to="/admin"
                                end
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Dashboard
                            </NavLink>

                            <NavLink
                                to="/admin/company-requests"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Company Requests
                            </NavLink>

                            <NavLink
                                to="/admin/companies"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Companies
                            </NavLink>

                            <NavLink
                                to="/admin/subscriptions"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Subscriptions
                            </NavLink>

                            <NavLink
                                to="/admin/subscription-history"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Subscription History
                            </NavLink>

                            <NavLink
                                to="/admin/candidates"
                                className={({ isActive }) => navLinkClass(isActive)}
                            >
                                Candidates
                            </NavLink>
                        </nav>

                        <Button
                            variant="danger"
                            onClick={() => handleLogout()}
                            className="mt-auto rounded-[10px] py-3 px-3.5 font-semibold text-sm flex items-center justify-center gap-2"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Logout
                        </Button>
                    </aside>

                    {/* Main Content Area */}
                    <main className="py-7 px-8 overflow-y-auto max-md:p-4 min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
    );
};

export default AdminLayout;
