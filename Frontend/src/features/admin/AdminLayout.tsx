import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../context/authSlice";
import type { AppDispatch } from "../../context/store";
import { SystemDataProvider } from "../../context/SystemDataContext";

const AdminLayout = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [showNotifications, setShowNotifications] = useState(false);
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
                        <div className="bg-linear-to-br from-[#6366f1] to-[#4f46e5] text-white w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-bold">
                            A
                        </div>
                        <h2 className="text-[#e5e7eb] m-0 text-xl font-semibold">
                            Admin Control Room
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 relative">
                        <button
                            onClick={() => setShowNotifications((v) => !v)}
                            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-3 text-[#94a3b8] cursor-pointer flex items-center justify-center relative transition-all duration-200 hover:bg-[rgba(255,255,255,0.08)]"
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
                        </button>

                        {showNotifications && (
                            <div className="absolute top-[50px] right-0 w-80 bg-[rgba(15,23,42,0.98)] border border-[rgba(255,255,255,0.08)] rounded-xl z-[1000] overflow-hidden">
                                <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.06)]">
                                    <h3 className="m-0 text-sm font-semibold">Notifications</h3>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="bg-none border-none text-[#94a3b8] cursor-pointer text-lg p-0 leading-none hover:text-[#e5e7eb]"
                                    >
                                        ×
                                    </button>
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

                {/* Main Content */}
                <div className="grid grid-cols-[240px_1fr] min-h-[calc(100vh-77px)] max-md:grid-cols-1">
                    {/* Sidebar */}
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

                        {/* Logout Button */}
                        <button
                            onClick={() => dispatch(logout())}
                            className="mt-auto bg-linear-to-br from-[#ef4444] to-[#dc2626] border-none rounded-[10px] py-3 px-3.5 text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)]"
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
                    <main className="py-7 px-8 overflow-y-auto max-md:p-4">
                        <Outlet />
                    </main>
                </div>
            </div>
        </SystemDataProvider>
    );
};

export default AdminLayout;
