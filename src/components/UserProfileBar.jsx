import React from "react";

function UserProfileBar({ user, handleLogout }) {
  // ✅ If user is not yet loaded, show a safe placeholder
  if (!user) {
    return (
      <div className="flex items-center space-x-3 animate-pulse">
        <div className="w-8 h-8 bg-gray-500 rounded-full"></div>
        <div>
          <div className="h-3 bg-gray-500 w-20 mb-1 rounded"></div>
          <div className="h-2 bg-gray-600 w-32 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <img
        src={user?.picture || "/default-avatar.png"} // ✅ fallback image
        alt={user?.name || "User"}
        className="w-8 h-8 rounded-full"
      />
      <div className="text-right">
        <h3 className="text-sm font-semibold text-white">
          {user?.name || "Guest"}
        </h3>
        <p className="text-xs text-gray-400 break-words">
          {user?.email || "No email available"}
        </p>
      </div>
    </div>
  );
}

export default UserProfileBar;
