import React, { useEffect, useState } from "react";
import StorageOverview from "./StorageOverview";
import StorageCharts from "./StorageCharts";

function Dashboard({ user }) {
  const [storageData, setStorageData] = useState(null);

  useEffect(() => {
    if (user?.drive) {
      // Convert backend data once here
      const bytesToGB = (bytes) => (bytes ? bytes / (1024 ** 3) : 0);

      const data = [
        {
          id: "drive",
          name: "Google Drive",
          used: bytesToGB(user.drive.usage),
          total: bytesToGB(user.drive.limit),
          color: "#3B82F6",
        },
        {
          id: "gmail",
          name: "Gmail",
          used: bytesToGB(user.gmail?.usage || 0),
          total: bytesToGB(user.gmail?.limit || 15 * 1024 ** 3),
          color: "#EF4444",
        },
        {
          id: "photos",
          name: "Google Photos",
          used: bytesToGB(user.photos?.usage || 3.5 * 1024 ** 3),
          total: 15,
          color: "#10B981",
        },
        {
          id: "mobile",
          name: "Mobile Backup",
          used: bytesToGB(user.mobileBackup?.usage || 1.2 * 1024 ** 3),
          total: 10,
          color: "#A855F7",
        },
      ];

      setStorageData(data);
    }
  }, [user]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pt-24 pb-8 px-4">
      <StorageOverview data={storageData} />
      <StorageCharts data={storageData} />
    </div>
  );
}

export default Dashboard;
