import { useState, useEffect } from "react";
import "./App.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RuleManager from "./components/RuleManager";
import ThemeToggle from "./components/ThemeToggle";
import UserProfileBar from "./components/UserProfileBar";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard"); // sidebar navigation

  // ✅ Restore session on refresh
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      console.warn("⚠️ Corrupted user data, clearing storage:", err);
      localStorage.removeItem("user");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // ✅ Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="flex">
      {/* ✅ Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col justify-between p-4">
        {/* Top section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">AutoCloud</h2>
            <ThemeToggle />
          </div>

          <button
            onClick={() => setActivePage("dashboard")}
            className={`w-full p-2 rounded mb-2 text-left ${
              activePage === "dashboard" ? "bg-purple-600" : "hover:bg-gray-700"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActivePage("ruleManager")}
            className={`w-full p-2 rounded text-left ${
              activePage === "ruleManager"
                ? "bg-purple-600"
                : "hover:bg-gray-700"
            }`}
          >
            Rule Manager
          </button>
        </div>

        {/* ✅ Bottom section */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm text-gray-400 mb-2 break-words">
            {user ? (
              <UserProfileBar user={user} handleLogout={handleLogout} />
            ) : (
              <div className="text-gray-500 text-xs">Loading profile...</div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded py-2"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ✅ Main Content */}
      <main className="ml-64 flex-1 h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {activePage === "dashboard" ? (
          <Dashboard user={user} handleLogout={handleLogout} />
        ) : (
          <RuleManager />
        )}
      </main>
    </div>
  );
}

export default App;
