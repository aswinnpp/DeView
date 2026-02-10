import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';

interface CandidateNavHeaderProps {
    title: string;
    currentPage?: 'jobs' | 'dashboard' | 'profile' | 'history' | 'mails' | 'interviews' | 'applied';
}

interface Notification {
    id: number;
    text: string;
    time: string;
}

const CandidateNavHeader: React.FC<CandidateNavHeaderProps> = ({ title, currentPage }) => {
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const { data: profileData, execute: fetchProfile } = useApi<{ hasProfile: boolean; data?: { fullName?: string } }>(
        '/candidate/profile',
        'GET'
    );

    useEffect(() => {
        fetchProfile();
    }, []);

    const getInitials = (name?: string): string => {
        if (!name) return 'C';
        const firstName = name.trim().split(' ')[0];
        return firstName ? firstName.charAt(0).toUpperCase() : 'C';
    };

    const candidateName = profileData?.data?.fullName || localStorage.getItem('userName') || '';

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

    const notifications: Notification[] = [
        { id: 1, text: "New job opportunity available", time: "5m ago" },
        { id: 2, text: "Interview scheduled for tomorrow", time: "1h ago" },
    ];

    return (
        <div className="flex justify-between items-center py-[18px] px-10 border-b border-[rgba(255,255,255,0.03)] bg-[rgba(255,255,255,0.01)] max-[480px]:py-3 max-[480px]:px-4">
            <div className="flex gap-3 items-center">
                <h2 className="m-0 text-lg font-bold text-white">{title}</h2>
            </div>

            <div className="flex gap-4 items-center">
                {currentPage !== 'jobs' && (
                    <Link to="/candidate/jobs" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                        Jobs
                    </Link>
                )}
                {currentPage !== 'interviews' && currentPage !== 'dashboard' && (
                    <Link to="/candidate/interviews" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                        Scheduled Interviews
                    </Link>
                )}
                {currentPage !== 'history' && (
                    <Link to="/candidate/history" className="text-[rgba(255,255,255,0.78)] no-underline py-2 px-2.5 rounded-lg font-semibold hover:bg-[rgba(255,255,255,0.02)] hover:text-white">
                        History
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

                <div className="relative" ref={notificationRef}>
                    <button
                        className="bg-none border-none cursor-pointer text-xl text-[rgba(255,255,255,0.95)] relative"
                        onClick={() => setShowNotifications((v) => !v)}
                        aria-expanded={showNotifications}
                        aria-controls="notification-list"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1.5 bg-linear-to-br from-brand-pink to-brand-pink-dark text-white px-1.5 py-0.5 text-[11px] font-bold rounded-full">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div
                            className="absolute top-[110%] right-0 w-80 bg-[rgba(12,12,18,0.98)] border border-[rgba(255,255,255,0.03)] rounded-xl shadow-[0_12px_30px_rgba(0,0,0,0.5)] z-[2000]"
                            id="notification-list"
                            role="menu"
                        >
                            <div className="flex justify-between items-center py-3.5 px-4 border-b border-[rgba(255,255,255,0.04)]">
                                <h3 className="m-0 text-white text-[15px]">Notifications</h3>
                                <button
                                    className="bg-none border-none text-[rgba(255,255,255,0.7)] cursor-pointer"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    ✕
                                </button>
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
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-bold">
                            {getInitials(candidateName)}
                        </div>
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default CandidateNavHeader;
