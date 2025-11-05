import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { HardDrive, Mail, Image, Smartphone } from "lucide-react";

function StorageOverview() {
  // ✅ Load user data from localStorage (set after Google login)
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Extract Google Drive info safely
  const drive = user?.drive || {};

  // ✅ Convert bytes → GB and calculate usage
  const total = drive.limit ? (Number(drive.limit) / (1024 ** 3)).toFixed(2) : 15;
  const used = drive.usage ? (Number(drive.usage) / (1024 ** 3)).toFixed(2) : 0;
  const free = (total - used).toFixed(2);
  const usagePercent = total > 0 ? ((used / total) * 100).toFixed(1) : 0;

  console.log("✅ Drive data loaded:", { total, used, free, usagePercent });

  // ✅ Dynamic storage data (Drive real, others placeholder for now)
  const storageData = [
    {
      id: "drive",
      name: "Google Drive",
      used: parseFloat(used),
      total: parseFloat(total),
      icon: HardDrive,
      color: "bg-blue-500",
    },
    {
      id: "gmail",
      name: "Gmail",
      used: 2.3, // static for now — Gmail usage could be fetched separately
      total: 15,
      icon: Mail,
      color: "bg-red-500",
    },
    {
      id: "photos",
      name: "Photos",
      used: 3.5,
      total: 15,
      icon: Image,
      color: "bg-green-500",
    },
    {
      id: "mobile",
      name: "Mobile Backup",
      used: 1.2,
      total: 10,
      icon: Smartphone,
      color: "bg-purple-500",
    },
  ];

  // ✅ Calculate overall totals
  const totalUsed = storageData.reduce((acc, item) => acc + item.used, 0);
  const totalStorage = storageData.reduce((acc, item) => acc + item.total, 0);
  const overallUsage = (totalUsed / totalStorage) * 100;

  return (
    <div className="space-y-6">
      {/* 🔹 Total Storage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {used} GB of {total} GB used
              </span>
              <span className="text-gray-900 dark:text-white">
                {usagePercent}%
              </span>
            </div>
            <Progress value={usagePercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* 🔹 Individual Storage Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storageData.map((item) => {
          const Icon = item.icon;
          const percentage = (item.used / item.total) * 100;

          return (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow dark:bg-gray-900"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-lg ${item.color} bg-opacity-10 dark:bg-opacity-20`}
                    >
                      <Icon
                        className={`w-5 h-5 ${item.color.replace("bg-", "text-")}`}
                      />
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.used.toFixed(2)} GB / {item.total} GB
                    </p>
                  </div>

                  <Progress value={percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default StorageOverview;
