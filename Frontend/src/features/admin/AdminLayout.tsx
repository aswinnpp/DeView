import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../context/store";
import { SystemDataProvider } from "../../context/SystemDataContext";
import { logout } from "../../context/authSlice";
import { authService } from "../../services/auth.service";
import { APP_ROUTES } from "../../constants/routes";
import { Button } from "../../components/common";

const AdminLayout = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

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

    const handleLogout = useCallback(async () => {
        
            await authService.logout();
            dispatch(logout());
            navigate(APP_ROUTES.LOGIN, { replace: true });
        
    }, [dispatch, navigate]);

    const notifications = [
        { id: 1, text: "New company registration request", time: "5m ago" },
        { id: 2, text: "Subscription payment received", time: "1h ago" },
    ];

    const navLinkClass = (isActive: boolean) =>
        `text-[#94a3b8] text-sm font-semibold rounded-[10px] py-3 px-3.5 no-underline flex items-center gap-2.5 transition-all duration-200 ${isActive
            ? 'text-white bg-linear-to-br from-[#6366f1] to-[#4f46e5]'
            : 'bg-transparent hover:text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)]'
        }`;

    return (
        <SystemDataProvider>
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
                        <div className="bg-linear-to-br from-[#6366f1] to-[#4f46e5] text-white w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-bold shrink-0">
                            A
                        </div>
                        <h2 className="text-[#e5e7eb] m-0 text-xl font-semibold max-md:text-base truncate">
                            Admin Control Room
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        <Button
                            variant="secondary"
                            onClick={() => setShowNotifications((v) => !v)}
                            className="!bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-3 text-[#94a3b8] flex items-center justify-center relative"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            {notifications.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-[#ef4444] text-white text-[10px] py-0.5 px-1.5 rounded-full font-bold">
                                    {notifications.length}
                                </span>
                            )}
                        </Button>

                        {showNotifications && (
                            <div className="absolute top-[50px] right-0 w-80 max-w-[calc(100vw-2rem)] bg-[rgba(15,23,42,0.98)] border border-[rgba(255,255,255,0.08)] rounded-xl z-[1000] overflow-hidden">
                                <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.06)]">
                                    <h3 className="m-0 text-sm font-semibold">Notifications</h3>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowNotifications(false)}
                                        className="!bg-none !border-none text-[#94a3b8] text-lg p-0 leading-none hover:text-[#e5e7eb]"
                                    >
                                        ×
                                    </Button>
                                </div>
                                <div className="max-h-70 overflow-y-auto">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="flex gap-3 py-3 px-4 border-b border-[rgba(255,255,255,0.03)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                                            <div className="w-2 h-2 rounded-full bg-[#6366f1] mt-1.5 shrink-0" />
                                            <div>
                                                <div className="text-[#e5e7eb] text-[13px]">{n.text}</div>
                                                <div className="text-[#64748b] text-[11px] mt-1">{n.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
        </SystemDataProvider>
    );
};

export default AdminLayout;
