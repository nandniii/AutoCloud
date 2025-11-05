// components/UserProfileBar.jsx
import React from "react";

const UserProfileBar = ({ user, handleLogout }) => {
  return (
    <div className="flex items-center gap-4">
      {user && (
        <>
          <img
            src={user.picture}
            alt="profile"
            className="w-10 h-10 rounded-full border border-gray-300"
          />
          <div className="text-right">
            <p className="text-gray-900 dark:text-white text-sm font-medium">
              {user.name}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {user.email}
            </p>
          </div>
        </>
      )}
      <button
        onClick={handleLogout}
        className="ml-4 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  );
};

export default UserProfileBar;