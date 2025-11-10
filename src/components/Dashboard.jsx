import React, { useEffect, useState } from "react";
import StorageOverview from "./StorageOverview";
import StorageCharts from "./StorageCharts";

function Dashboard({ user }) {
  const [storageData, setStorageData] = useState([]);

  useEffect(() => {
    // Debug: log incoming user
    console.log("Dashboard: user prop:", user);

    // Build storageData even if some fields are missing
    const buildData = (u) => {
      if (!u) return [];

      // Backend already provides GB values, so use them directly
      const driveUsed = typeof u.drive?.usage === "number" ? u.drive.usage : 0;
      const driveTotal = typeof u.drive?.limit === "number" ? u.drive.limit : 15;

      const gmailUsed = typeof u.gmail?.usage === "number" ? u.gmail.usage : 0;
      const gmailTotal = typeof u.gmail?.limit === "number" ? u.gmail.limit : driveTotal;

      const photosUsed = typeof u.photos?.usage === "number" ? u.photos.usage : 0;
      const photosTotal = typeof u.photos?.limit === "number" ? u.photos.limit : driveTotal;

      const mobileUsed = typeof u.mobileBackup?.usage === "number" ? u.mobileBackup.usage : 0.5;
      const mobileTotal = typeof u.mobileBackup?.limit === "number" ? u.mobileBackup.limit : 10;

      return [
        { id: "drive", name: "Google Drive", used: driveUsed, total: driveTotal, color: "#3B82F6" },
        { id: "gmail", name: "Gmail", used: gmailUsed, total: gmailTotal, color: "#EF4444" },
        { id: "photos", name: "Google Photos", used: photosUsed, total: photosTotal, color: "#10B981" },
        { id: "mobile", name: "Mobile Backup", used: mobileUsed, total: mobileTotal, color: "#A855F7" },
      ];
    };

    const data = buildData(user);
    console.log("Dashboard: storageData built:", data);
    setStorageData(data);
  }, [user]);

  if (!user) {
    return (
      <div className="text-center text-gray-400 mt-10">
        Loading storage...
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pt-24 pb-8 px-4">
      <StorageOverview user={user} />
      <StorageCharts data={storageData} />
    </div>
  );
}

export default Dashboard;
