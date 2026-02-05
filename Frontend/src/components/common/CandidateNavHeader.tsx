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

    // Fetch candidate profile to get fullName for avatar
    const { data: profileData } = useApi<{ hasProfile: boolean; data?: { fullName?: string } }>({
        url: '/candidate/profile',
        method: 'GET',
        immediate: true,
    });

    // Get first letter of first name for avatar
    const getInitials = (name?: string): string => {
        if (!name) return 'C'; // Default to "C" for Candidate
        const firstName = name.trim().split(' ')[0];
        return firstName ? firstName.charAt(0).toUpperCase() : 'C';
    };

    const candidateName = profileData?.data?.fullName || localStorage.getItem('userName') || '';

    // Close notification dropdown when clicking outside
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
        <div className="candidate-header">
            <div className="logo">
                <h2>{title}</h2>
            </div>

            <div className="header-actions">
                {currentPage !== 'jobs' && (
                    <Link to="/candidate/jobs" className="nav-link">
                        Jobs
                    </Link>
                )}
                {currentPage !== 'interviews' && currentPage !== 'dashboard' && (
                    <Link to="/candidate/interviews" className="nav-link">
                        Scheduled Interviews
                    </Link>
                )}
                {currentPage !== 'history' && (
                    <Link to="/candidate/history" className="nav-link">
                        History
                    </Link>
                )}
                {currentPage !== 'mails' && (
                    <Link to="/candidate/mails" className="nav-link">
                        Mails
                    </Link>
                )}
                {currentPage !== 'applied' && (
                    <Link to="/candidate/applied" className="nav-link">
                        Applied Jobs
                    </Link>
                )}

                <div
                    className="notification-container"
                    ref={notificationRef}
                    style={{ position: "relative" }}
                >
                    <button
                        className="notification-bell"
                        onClick={() => setShowNotifications((v) => !v)}
                        aria-expanded={showNotifications}
                        aria-controls="notification-list"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        {notifications.length > 0 && (
                            <span className="notification-badge">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div
                            className="notification-dropdown"
                            id="notification-list"
                            role="menu"
                        >
                            <div className="notification-header">
                                <h3>Notifications</h3>
                                <button
                                    className="close-notifications"
                                    onClick={() => setShowNotifications(false)}
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="notification-list">
                                {notifications.length === 0 ? (
                                    <div className="no-notifications">
                                        <span>🔕</span>
                                        <p>You're all caught up</p>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="notification-item">
                                            <div className="notification-icon">📣</div>
                                            <div className="notification-content">
                                                <div className="notification-text">{n.text}</div>
                                                <div className="notification-time">{n.time}</div>
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
                            `profile-avatar-link ${isActive ? "active" : ""}`
                        }
                        title="Profile"
                    >
                        <div className="profile-avatar">
                            {getInitials(candidateName)}
                        </div>
                    </NavLink>
                )}
            </div>
        </div>
    );
};

export default CandidateNavHeader;
