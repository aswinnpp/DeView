import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

interface CompanyData {
    companyName: string;
    contactEmail?: string;
    subscription?: string;
}

const CompanyLayout = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [companyData] = useState<CompanyData | null>(null);

    const notifications = [
        { id: 1, text: 'Welcome to Intervu for Business!', time: 'Just now' },
    ];

    const companyName = companyData?.companyName || 'Company';
    const companyInitial = companyName.charAt(0).toUpperCase();

    const navTabClass = (isActive: boolean) =>
        `block py-2.5 px-3 rounded-lg no-underline font-semibold text-sm transition-all duration-200 ${isActive
            ? 'bg-[rgba(255,255,255,0.03)] text-white'
            : 'text-[#cbd5e1] hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
        }`;

    return (
        <div className="hr-theme min-h-screen w-full bg-linear-to-br from-[#111318] to-[#0b0f17] font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[rgba(255,255,255,0.95)] box-border">
            <div className="w-full min-h-screen bg-[rgba(15,15,25,0.96)] border border-[rgba(255,255,255,0.03)] backdrop-blur-[10px] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center py-[18px] px-10 border-b border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)]">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[#e5e7eb] m-0">
                            {companyName} Dashboard
                        </h2>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <button className="bg-none border-none cursor-pointer text-xl text-[rgba(255,255,255,0.95)] relative p-2 rounded-lg hover:bg-[rgba(255,255,255,0.08)]" onClick={() => setShowNotifications((v) => !v)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 bg-[#ef4444] text-white px-1.5 py-0.5 text-[10px] font-bold rounded-full">{notifications.length}</span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute top-[110%] right-0 w-80 bg-[rgba(12,12,18,0.98)] border border-[rgba(255,255,255,0.03)] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-[2000]">
                                    <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.04)]">
                                        <h3 className="m-0 text-white text-[15px]">Notifications</h3>
                                        <button className="bg-none border-none text-[rgba(255,255,255,0.7)] cursor-pointer" onClick={() => setShowNotifications(false)}>✕</button>
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

                <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-80px)] max-lg:grid-cols-1">
                    <aside className="flex flex-col justify-start py-5 px-4 gap-3 min-w-[220px] box-border bg-[rgba(255,255,255,0.03)] border-r border-[rgba(255,255,255,0.08)] max-lg:border-r-0 max-lg:border-b max-lg:border-b-[rgba(255,255,255,0.08)]">
                        <nav className="flex flex-col gap-2 mb-3">
                            <NavLink to="/company/dashboard" className={({ isActive }) => navTabClass(isActive)}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/company/jobs" className={({ isActive }) => navTabClass(isActive)}>
                                Jobs
                            </NavLink>
                            <NavLink to="/company/applications" className={({ isActive }) => navTabClass(isActive)}>
                                Applications
                            </NavLink>
                            <NavLink to="/company/team" className={({ isActive }) => navTabClass(isActive)}>
                                HR Manage
                            </NavLink>
                        </nav>

                        <NavLink
                            to="/company/profile"
                            className="flex items-center gap-3 py-2.5 px-3 mt-auto rounded-xl cursor-pointer select-none transition-all duration-150 bg-linear-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] self-stretch shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] no-underline hover:bg-[rgba(255,255,255,0.03)] hover:-translate-y-px"
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-linear-to-br from-[#6366f1] to-[#8b5cf6] overflow-hidden shrink-0 max-[900px]:w-10 max-[900px]:h-10">
                                <div className="font-bold text-lg text-white p-1.5">
                                    {companyInitial}
                                </div>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="text-[13px] font-semibold text-[#e6eef7] whitespace-nowrap overflow-hidden text-ellipsis max-[900px]:text-xs">{companyName}</div>
                                <div className="text-[11px] text-[#94a3b8] max-[900px]:text-[10px]">View Profile</div>
                            </div>
                        </NavLink>
                    </aside>

                    <main className="bg-[rgba(255,255,255,0.01)]" style={{ padding: '24px 32px' }}>
                        <div className="flex flex-col h-full">
                            <div className="flex-1 overflow-y-auto">
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default CompanyLayout
