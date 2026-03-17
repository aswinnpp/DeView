import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { candidateService } from '../../services/candidate.service';
import { Button, NotificationBell } from '../../components/common';

interface ICandidateNavHeaderProps {
    title: string;
    currentPage?: 'jobs' | 'dashboard' | 'profile' | 'mails' | 'interviews' | 'applied';
}

interface INotification {
    id: number;
    text: string;
    time: string;
}

const CandidateNavHeader = ({ title, currentPage }: ICandidateNavHeaderProps) => {
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const [candidateName, setCandidateName] = useState<string>(localStorage.getItem('userName') || '');
    const [candidateProfilePicUrl, setCandidateProfilePicUrl] = useState<string>('');

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
        const loadProfile = async () => {
            try {
                const { data: profileData } = await candidateService.getProfile();
                if (profileData?.profile?.fullName) setCandidateName(profileData.profile.fullName);
                if (profileData?.profile?.profilePicUrl) {
                    try {
                        const { data } = await candidateService.getProfilePicViewUrl();
                        setCandidateProfilePicUrl(data.url);
                    } catch {
                        setCandidateProfilePicUrl('');
                    }
                }
            } catch {
                // Silently fail — use fallback name
            }
        };
        loadProfile();
    }, []);

    const getInitials = (name?: string): string => {
        if (!name) return 'C';
        const firstName = name.trim().split(' ')[0];
        return firstName ? firstName.charAt(0).toUpperCase() : 'C';
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    const notifications: INotification[] = [
        { id: 1, text: "New job opportunity available", time: "5m ago" },
        { id: 2, text: "Interview scheduled for tomorrow", time: "1h ago" },
    ];

    return (
        <>
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[150] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <header className="sticky top-0 z-1000 max-md:py-3 max-md:px-4 flex justify-between items-center py-[18px] px-10 border-b border-[rgba(255,255,255,0.03)] bg-[rgba(15,15,25,0.98)] backdrop-blur-md max-[480px]:py-3 max-[480px]:px-4 zinde">
                <div className="flex gap-3 items-center">
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
                    <h2 className="m-0 text-lg max-md:text-base font-bold text-white truncate">{title}</h2>
                </div>

                {/* Desktop navigation */}
                <div className="hidden md:flex gap-4 items-center">
                    {currentPage !== 'jobs' && (
                        <Link to="/candidate/jobs" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                            Jobs
                        </Link>
                    )}
                    {currentPage !== 'interviews' && currentPage !== 'dashboard' && (
                        <Link to="/candidate/interviews" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                             Interviews
                        </Link>
                    )}
                    {currentPage !== 'mails' && (
                        <Link to="/candidate/mails" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                            Mails
                        </Link>
                    )}
                    {currentPage !== 'applied' && (
                        <Link to="/candidate/applied" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                            Applied Jobs
                        </Link>
                    )}
                </div>

                {/* Mobile/Desktop: Notifications and Profile */}
                <div className="flex gap-3 max-md:gap-2 items-center">

                <div className="relative" ref={notificationRef}>
                    <NotificationBell
                        className="!bg-none !border-none cursor-pointer text-xl text-[rgba(255,255,255,0.95)] relative"
                        onClick={() => setShowNotifications((v) => !v)}
                        aria-expanded={showNotifications}
                        aria-controls="notification-list"
                        count={notifications.length}
                        badgeClassName="-top-1 -right-1.5 bg-linear-to-br from-brand-pink to-brand-pink-dark text-[11px]"
                    />

                    {showNotifications && (
                        <div
                            className="absolute top-[110%] right-0 w-80 max-w-[calc(100vw-2rem)] bg-[rgba(12,12,18,0.98)] border border-[rgba(255,255,255,0.03)] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-[2000]"
                            id="notification-list"
                            role="menu"
                        >
                            <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.04)]">
                                <h3 className="m-0 text-white text-[15px]">Notifications</h3>
                                <Button
                                    variant="secondary"
                                    className="!bg-none !border-none text-[rgba(255,255,255,0.7)] cursor-pointer"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    ✕
                                </Button>
                            </div>
                            <div>
                                {notifications.length === 0 ? (
                                    <div className="text-center py-6">
                                        <span>🔕</span>
                                        <p className="text-[rgba(255,255,255,0.5)] text-sm">You're all caught up</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="flex items-start gap-3 p-4 border-b border-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.02)]">
                                            <div className="text-lg">📣</div>
                                            <div>
                                                <div className="text-white text-sm">{n.text}</div>
                                                <div className="text-[rgba(255,255,255,0.5)] text-xs mt-1">{n.time}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {currentPage !== 'profile' && (
                    <NavLink
                        to="/candidate/profile"
                        className={({ isActive }) =>
                            `no-underline ${isActive ? "ring-2 ring-brand-primary rounded-full" : ""}`
                        }
                        title="Profile"
                    >
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-bold">
                            {candidateProfilePicUrl ? (
                                <img
                                    src={candidateProfilePicUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                getInitials(candidateName)
                            )}
                        </div>
                    </NavLink>
                )}
                </div>
            </header>

            {/* Mobile sidebar menu */}
            <aside
                className={`fixed top-0 left-0 z-[200] h-full w-[240px] max-w-[85vw] bg-[rgba(15,15,25,0.98)] border-r border-[rgba(255,255,255,0.06)] py-5 px-4 flex flex-col shadow-xl transition-transform duration-200 ease-out md:hidden ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between mb-4 px-1">
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
                <nav className="flex flex-col gap-2 flex-1" onClick={() => setSidebarOpen(false)}>
                    {currentPage !== 'jobs' && (
                        <Link to="/candidate/jobs" className="text-[rgba(255,255,255,0.78)] no-underline py-2.5 px-3 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white transition-colors">
                            Jobs
                        </Link>
                    )}
                    {currentPage !== 'interviews' && currentPage !== 'dashboard' && (
                        <Link to="/candidate/interviews" className="text-[rgba(255,255,255,0.78)] no-underline py-2.5 px-3 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white transition-colors">
                             Interviews
                        </Link>
                    )}
                    {currentPage !== 'mails' && (
                        <Link to="/candidate/mails" className="text-[rgba(255,255,255,0.78)] no-underline py-2.5 px-3 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white transition-colors">
                            Mails
                        </Link>
                    )}
                    {currentPage !== 'applied' && (
                        <Link to="/candidate/applied" className="text-[rgba(255,255,255,0.78)] no-underline py-2.5 px-3 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white transition-colors">
                            Applied Jobs
                        </Link>
                    )}
                    {currentPage !== 'profile' && (
                        <NavLink
                            to="/candidate/profile"
                            className={({ isActive }) =>
                                `no-underline py-2.5 px-3 rounded-lg font-semibold transition-colors ${isActive ? "bg-[rgba(102,126,234,0.2)] text-white" : "text-[rgba(255,255,255,0.78)] hover:bg-[rgba(255,255,255,0.02)] hover:text-white"}`
                            }
                            title="Profile"
                        >
                            Profile
                        </NavLink>
                    )}
                </nav>
            </aside>
        </>
    );
};

export default CandidateNavHeader;
