import { NavLink, Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { APP_ROUTES } from "../../constants/routes";
import { useSelector } from "react-redux";
import type { RootState } from "../../context/store";
import { interviewerProfileService } from "../../services/interviewerProfile.service";
import { NotificationBell } from "../../components/common";
import { useNotifications } from "../../hooks/notifications/useNotifications";

const InterviewerLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
const adminUser = useSelector(
  (state: RootState) => state.auth.adminUser
);

const normalUser = useSelector(
  (state: RootState) => state.auth.normalUser
);

  const user = adminUser ?? normalUser;
  const [profilePicViewUrl, setProfilePicViewUrl] = useState<string>("");
  const { notifications, unreadCount, markRead, formatTime, refresh } = useNotifications("interviewer");

  const role = (user?.role || "").toLowerCase();

  const navLinkClass = (isActive: boolean) =>
    `text-sm font-medium py-2.5 px-2.5 rounded-lg no-underline transition-all duration-300 ${
      isActive
        ? "text-white bg-white/10"
        : "text-white/70 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
    }`;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    interviewerProfileService
      .getProfilePicViewUrl()
      .then((res) => {
        if (!cancelled) setProfilePicViewUrl(res.url);
      })
      .catch(() => {
        if (!cancelled) setProfilePicViewUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!showNotifications) return;
    refresh().catch(() => {});
  }, [showNotifications, refresh]);

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

  if (!user) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  if (role !== "interviewer") {
    switch (role) {
      case "candidate":
        return <Navigate to="/candidate" replace />;
      case "admin":
        return <Navigate to={APP_ROUTES.ADMIN_DASHBOARD} replace />;
      case "company":
        return <Navigate to={APP_ROUTES.COMPANY_DASHBOARD} replace />;
      case "hr":
        return <Navigate to={APP_ROUTES.HR_DASHBOARD} replace />;
      default:
        return <Navigate to={APP_ROUTES.ROOT} replace />;
    }
  }

  const initials =
    (user?.fullName || "I")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "I";

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] relative overflow-x-hidden">
      <div className="w-full min-h-screen bg-[rgba(10,10,18,0.95)] backdrop-blur-[20px] border border-white/10 relative overflow-auto">
        <header className="flex justify-between items-center py-4 px-4 sm:px-6 md:px-8 border-b border-white/10 bg-white/[0.03] backdrop-blur-[10px]">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h2 className="text-white m-0 text-base sm:text-lg font-semibold truncate">Interviewer Console</h2>
          </div>

          <div className="hidden md:flex gap-2 lg:gap-3 items-center">
            <NavLink to="/interviewer/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
              Dashboard
            </NavLink>
            <NavLink to="/interviewer/assignments" className={({ isActive }) => navLinkClass(isActive)}>
              Assignments
            </NavLink>
            <NavLink to="/interviewer/manage" className={({ isActive }) => navLinkClass(isActive)}>
              Manage
            </NavLink>
            <NavLink to={APP_ROUTES.INTERVIEWER_SLOTS} className={({ isActive }) => navLinkClass(isActive)}>
              Slots
            </NavLink>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to={APP_ROUTES.INTERVIEWER_PROFILE}
              className={({ isActive }) =>
                `no-underline ${isActive ? "ring-2 ring-blue-500/60 rounded-full" : ""}`
              }
              title="Profile"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 border border-white/10 flex items-center justify-center text-white text-xs font-bold">
                {profilePicViewUrl ? (
                  <img src={profilePicViewUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
            </NavLink>

            <div className="relative">
              <NotificationBell
                as="native"
                className="relative bg-transparent border-none text-white/70 text-xl cursor-pointer p-2 rounded-lg transition-all duration-300 hover:text-white hover:bg-white/10 hover:scale-110"
                onClick={() => setShowNotifications((v) => !v)}
                aria-expanded={showNotifications}
                aria-controls="notification-list"
                count={unreadCount}
                badgeClassName="bg-gradient-to-br from-pink-500 to-pink-700 text-[10px] font-semibold py-0.5 px-1.5 rounded-full min-w-4 text-center leading-none"
              />

              {showNotifications && (
                <div
                  id="notification-list"
                  role="menu"
                  className="absolute top-full right-0 w-[min(20rem,calc(100vw-1rem))] bg-[rgba(15,15,25,0.95)] border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] backdrop-blur-[20px] z-[10000] mt-2"
                >
                  <div className="flex justify-between items-center py-4 px-5 border-b border-white/10">
                    <h3 className="text-white m-0 text-base font-semibold">Notifications</h3>
                    <button
                      type="button"
                      className="bg-transparent border-none text-white/80 cursor-pointer p-1 rounded hover:bg-white/10"
                      onClick={() => setShowNotifications(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-white/70">
                        <span className="text-2xl mb-2">No notifications</span>
                        <p className="m-0 text-sm">You're all caught up</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="w-full text-left flex items-start gap-3 py-4 px-5 border-none border-b border-white/[0.05] bg-transparent transition-colors duration-300 hover:bg-white/[0.03] cursor-pointer"
                          onClick={() => markRead(n.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm leading-snug m-0 mb-1 whitespace-pre-wrap break-words">
                              {n.message || n.title}
                            </p>
                            <p className="text-white/60 text-xs m-0">{formatTime(n.createdAt)}</p>
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

        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-[150] md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside
          className={`fixed top-0 left-0 z-[200] h-screen max-h-[100dvh] w-[240px] max-w-[85vw] bg-[rgba(15,15,25,0.98)] border-r border-[rgba(255,255,255,0.06)] py-5 px-4 flex flex-col overflow-hidden shadow-xl transition-transform duration-200 ease-out md:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-4 px-1 shrink-0">
            <span className="text-white font-semibold text-sm">Menu</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex items-center justify-center p-2 rounded-lg border border-white/10 text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden" onClick={() => setSidebarOpen(false)}>
            <NavLink to="/interviewer/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
              Dashboard
            </NavLink>
            <NavLink to="/interviewer/assignments" className={({ isActive }) => navLinkClass(isActive)}>
              Assignments
            </NavLink>
            <NavLink to="/interviewer/manage" className={({ isActive }) => navLinkClass(isActive)}>
              Manage
            </NavLink>
            <NavLink to={APP_ROUTES.INTERVIEWER_SLOTS} className={({ isActive }) => navLinkClass(isActive)}>
              Slots
            </NavLink>
            <NavLink to={APP_ROUTES.INTERVIEWER_PROFILE} className={({ isActive }) => navLinkClass(isActive)}>
              Profile
            </NavLink>
          </nav>
        </aside>

        <main className="py-4 sm:py-6 px-4 sm:px-6 md:px-8 overflow-y-auto bg-white/[0.01]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InterviewerLayout;
