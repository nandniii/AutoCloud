import React from "react";

function UserProfileBar({ user, handleLogout }) {
  return (
    <div className="flex items-center space-x-3">
      <img
        src={user.picture}
        alt={user.name}
        className="w-8 h-8 rounded-full"
      />
      <div className="text-right">
        <h3 className="text-sm font-semibold text-white">{user.name}</h3>
        <p className="text-xs text-gray-400 break-words">{user.email}</p>
        
      </div>
    </div>
  );
}

export default UserProfileBar;
