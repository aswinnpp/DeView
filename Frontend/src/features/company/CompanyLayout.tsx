import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../components/common';
import { SystemDataProvider } from '../../context/SystemDataContext';
import { APP_ROUTES } from '../../constants/routes';
import { useSelector } from 'react-redux';
import type { RootState } from '../../context/store';


const CompanyLayout = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    const role = (user?.role || "").toLowerCase();

    if (!user) {
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }

    if (role !== "company") {
        switch (role) {
            case "candidate":
                return <Navigate to="/candidate" replace />;
            case "admin":
                return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;
            case "hr":
                return <Navigate to={APP_ROUTES.HR_DASHBOARD} replace />;
            case "interviewer":
                return <Navigate to={APP_ROUTES.INTERVIEWER_ASSIGNMENTS} replace />;
            default:
                return <Navigate to={APP_ROUTES.ROOT} replace />;
        }
    }

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

    const notifications = [
        { id: 1, text: 'Welcome to Intervu for Business!', time: 'Just now' },
    ];



    const navTabClass = (isActive: boolean) =>
        `block py-2.5 px-3 rounded-lg no-underline font-semibold text-sm transition-all duration-200 ${isActive
            ? 'bg-[rgba(255,255,255,0.03)] text-white'
            : 'text-[#cbd5e1] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
        }`;

    return (
        <div className="hr-theme min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] box-border">
            <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px]">
                {/* Header */}
                <div className="flex justify-between items-center py-[18px] px-10 max-md:py-3 max-md:px-4 border-b border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)] sticky top-0 z-[100] backdrop-blur-[10px]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Mobile menu toggle */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSidebarOpen((o) => !o)}
                            className="md:hidden !bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white flex items-center justify-center shrink-0"
                            aria-label="Toggle menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </Button>
                        <h2 className="text-[#e5e7eb] m-0 max-md:text-base truncate">
                            Dashboard
                        </h2>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <Button variant="secondary" className="!bg-none !border-none cursor-pointer text-xl text-[rgba(255,255,255,0.95)] relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)]" onClick={() => setShowNotifications((v) => !v)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-[#ef4444] text-white px-1.5 py-0.5 text-[10px] font-bold rounded-full">{notifications.length}</span>
                                )}
                            </Button>
                            {showNotifications && (
                                <div className="absolute top-[110%] right-0 w-80 max-w-[calc(100vw-2rem)] bg-[rgba(12,12,18,0.98)] border border-[rgba(255,255,255,0.03)] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-[2000]">
                                    <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.04)]">
                                        <h3 className="m-0 text-white text-[15px]">Notifications</h3>
                                        <Button variant="secondary" className="!bg-none !border-none text-[rgba(255,255,255,0.7)] cursor-pointer" onClick={() => setShowNotifications(false)}>✕</Button>
                                    </div>
                                    <div>
                                        {notifications.map((n) => (
                                            <div key={n.id} className="flex items-start gap-3 p-4 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)]">
                                                <div className="text-lg">📣</div>
                                                <div>
                                                    <div className="text-white text-sm">{n.text}</div>
                                                    <div className="text-[rgba(255,255,255,0.5)] text-xs mt-1">{n.time}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-[150] md:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-80px)] max-md:grid-cols-1">
                    {/* Desktop Sidebar */}
                    <aside className="flex flex-col justify-start py-5 px-4 gap-3 min-w-[220px] box-border bg-[rgba(255,255,255,0.03)] border-r border-[rgba(255,255,255,0.08)] h-[calc(100vh-73px)] sticky top-[73px] max-md:hidden">
                        <nav className="flex flex-col gap-2 mb-3">
                            <NavLink to="/company/dashboard" className={({ isActive }) => navTabClass(isActive)}>
                                Dashboard
                            </NavLink>
                            <NavLink to={APP_ROUTES.JOBS_PATH('company')} className={({ isActive }) => navTabClass(isActive)}>
                                Jobs
                            </NavLink>
                            <NavLink to="/company/applications" className={({ isActive }) => navTabClass(isActive)}>
                                Applications
                            </NavLink>
                            <NavLink to="/company/offer-letters" className={({ isActive }) => navTabClass(isActive)}>
                                Offer Letters
                            </NavLink>
                            <NavLink to="/company/team" className={({ isActive }) => navTabClass(isActive)}>
                                Team Management
                            </NavLink>
                        </nav>

                        <NavLink
                            to="/company/profile"
                            className="flex items-center gap-3 py-2.5 px-3 mt-auto rounded-xl cursor-pointer select-none transition-all duration-150 bg-linear-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] self-stretch shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] no-underline hover:bg-[rgba(255,255,255,0.03)] hover:-translate-y-px"
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br from-[#6366f1] to-[#8b5cf6] overflow-hidden shrink-0">
                                <div className="font-bold text-lg text-white p-1.5">
                                   P
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[13px] font-semibold text-[#e6eef7] whitespace-nowrap overflow-hidden text-ellipsis">View Profile </div>
                                <div className="text-[11px] text-[#94a3b8]"></div>
                            </div>
                        </NavLink>
                    </aside>

                    {/* Mobile Sidebar - overlay when open, fixed height to screen, not scrollable */}
                    <aside
                        className={`fixed top-0 left-0 z-[200] h-screen max-h-[100dvh] w-[240px] max-w-[85vw] bg-[rgba(15,15,25,0.98)] border-r border-[rgba(255,255,255,0.06)] py-5 px-4 flex flex-col overflow-hidden shadow-xl transition-transform duration-200 ease-out md:hidden ${
                            sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                    >
                        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                            <span className="text-white font-semibold text-sm">Menu</span>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setSidebarOpen(false)}
                                className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.08)] p-2 rounded-lg text-white"
                                aria-label="Close menu"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </Button>
                        </div>
                        <nav className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden" onClick={() => setSidebarOpen(false)}>
                            <NavLink to="/company/dashboard" className={({ isActive }) => navTabClass(isActive)}>
                                Dashboard
                            </NavLink>
                            <NavLink to={APP_ROUTES.JOBS_PATH('company')} className={({ isActive }) => navTabClass(isActive)}>
                                Jobs
                            </NavLink>
                            <NavLink to="/company/applications" className={({ isActive }) => navTabClass(isActive)}>
                                Applications
                            </NavLink>
                            <NavLink to="/company/offer-letters" className={({ isActive }) => navTabClass(isActive)}>
                                Offer Letters
                            </NavLink>
                            <NavLink to="/company/team" className={({ isActive }) => navTabClass(isActive)}>
                                Team Management
                            </NavLink>
                        </nav>
                        <NavLink
                            to="/company/profile"
                            className="mt-auto shrink-0 flex items-center gap-3 py-2.5 px-3 rounded-xl cursor-pointer select-none transition-all duration-150 bg-linear-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] self-stretch shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] no-underline hover:bg-[rgba(255,255,255,0.03)]"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br from-[#6366f1] to-[#8b5cf6] overflow-hidden shrink-0">
                                <div className="font-bold text-lg text-white p-1.5">
                                    P
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[13px] font-semibold text-[#e6eef7] whitespace-nowrap overflow-hidden text-ellipsis">View Profile</div>
                            </div>
                        </NavLink>
                    </aside>

                    <main className="bg-[rgba(255,255,255,0.01)] overflow-y-auto max-md:p-4 max-md:overflow-x-hidden" style={{ padding: '24px 32px' }}>
                        <SystemDataProvider>
                            <div className="flex flex-col h-full max-md:min-w-0">
                                <div className="flex-1 overflow-y-auto max-md:overflow-x-hidden">
                                    <Outlet />
                                </div>
                            </div>
                        </SystemDataProvider>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default CompanyLayout
