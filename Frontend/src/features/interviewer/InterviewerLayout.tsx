import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

interface Notification {
  id: number;
  text: string;
  time: string;
}

const InterviewerLayout: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications: Notification[] = [
    { id: 1, text: "Interview #123 starts in 15 mins", time: "Just now" },
    { id: 2, text: "Candidate Priya submitted code", time: "10m ago" },
  ];

  const navLinkClass = (isActive: boolean) =>
    `text-sm font-medium py-2.5 px-2.5 rounded-lg no-underline transition-all duration-300 ${
      isActive
        ? "text-white bg-white/10"
        : "text-white/70 hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
    }`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] relative overflow-x-auto">
      <div className="w-full min-h-screen bg-[rgba(10,10,18,0.95)] backdrop-blur-[20px] border border-white/10 relative overflow-auto">
        <header className="flex justify-between items-center py-5 px-7 md:px-8 border-b border-white/10 bg-white/[0.03] backdrop-blur-[10px]">
          <h2 className="text-white m-0 text-lg font-semibold">Interviewer Console</h2>

          <div className="flex gap-5 items-center max-[425px]:relative max-[425px]:left-[30px] max-[375px]:left-10">
            <NavLink to="/interviewer/dashboard" className={({ isActive }) => navLinkClass(isActive)}>
              Dashboard
            </NavLink>
            <NavLink to="/interviewer/assignments" className={({ isActive }) => navLinkClass(isActive)}>
              Assignments
            </NavLink>
            <NavLink to="/interviewer/manage" className={({ isActive }) => navLinkClass(isActive)}>
              Manage
            </NavLink>

            <div className="relative">
              <button
                type="button"
                className="relative bg-transparent border-none text-white/70 text-xl cursor-pointer p-2 rounded-lg transition-all duration-300 hover:text-white hover:bg-white/10 hover:scale-110"
                onClick={() => setShowNotifications((v) => !v)}
                aria-expanded={showNotifications}
                aria-controls="notification-list"
              >
                🔔
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-gradient-to-br from-pink-500 to-pink-700 text-white text-[10px] font-semibold py-0.5 px-1.5 rounded-full min-w-4 text-center leading-none">
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  id="notification-list"
                  role="menu"
                  className="absolute top-full right-0 w-80 bg-[rgba(15,15,25,0.95)] border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] backdrop-blur-[20px] z-[10000] mt-2 max-[425px]:mr-12 max-[375px]:mr-12 max-[320px]:mr-12"
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
                        <span className="text-2xl mb-2">🔕</span>
                        <p className="m-0 text-sm">You're all caught up</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="flex items-start gap-3 py-4 px-5 border-b border-white/[0.05] transition-colors duration-300 hover:bg-white/[0.03]"
                        >
                          <div className="text-lg w-6 text-center shrink-0">📣</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm leading-snug m-0 mb-1">{n.text}</p>
                            <p className="text-white/60 text-xs m-0">{n.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="py-6 px-8 overflow-y-auto bg-white/[0.01]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InterviewerLayout;
