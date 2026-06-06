import React, { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * Main Shell Layout containing a sidebar navigation drawer and a content viewport.
 */
const Layout = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: "📊" },
    { name: "Student Directory", path: "/students", icon: "🎓" },
    { name: "Company Directory", path: "/companies", icon: "🏢" },
    { name: "Drive Pipeline", path: "/pipeline", icon: "⚡" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 shadow-xl z-20">
        <div>
          {/* Sidebar Header / Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              STON PLACEMENTS
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          {user && (
            <div className="px-4 py-2 bg-slate-800/50 rounded-lg">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Officer Session</p>
              <p className="text-sm font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-lg shadow-rose-600/20"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-800">
            Placement Officer Operations Portal
          </h1>
          <div className="text-xs text-slate-400 font-medium">
            System Local Time: {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <div className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
