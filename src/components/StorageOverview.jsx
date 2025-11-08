import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { HardDrive, Mail, Image, Smartphone } from "lucide-react";

function StorageOverview() {
  // ✅ Load user data from localStorage (set after Google login)
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Extract Google Drive info safely
  const driveLimitBytes = user?.drive?.limit ? Number(user.drive.limit) : 15 * 1024 ** 3;
  const driveUsedBytes = user?.drive?.usage ? Number(user.drive.usage) : 0;

  // ✅ Convert bytes → GB (numbers only)
  const totalGB = driveLimitBytes / 1024 ** 3;
  const usedGB = driveUsedBytes / 1024 ** 3;
  const freeGB = totalGB - usedGB;

  // ✅ Calculate usage percentage
  const usagePercent = totalGB > 0 ? (usedGB / totalGB) * 100 : 0;

  console.log("✅ Drive data loaded:", {
    totalGB: totalGB.toFixed(2),
    usedGB: usedGB.toFixed(2),
    freeGB: freeGB.toFixed(2),
    usagePercent: usagePercent.toFixed(1),
  });

  // ✅ Dynamic storage data (Drive real, others placeholders for now)
  const storageData = [
    {
      id: "drive",
      name: "Google Drive",
      used: usedGB,
      total: totalGB,
      icon: HardDrive,
      color: "bg-blue-500",
    },
    {
      id: "gmail",
      name: "Gmail",
      used: user?.gmail?.usage ? Number(user.gmail.usage) / 1024 ** 3 : 2.3, // GB
      total: user?.gmail?.limit ? Number(user.gmail.limit) / 1024 ** 3 : 15,
      icon: Mail,
      color: "bg-red-500",
    },
    {
      id: "photos",
      name: "Google Photos",
      used: user?.photos?.usage ? Number(user.photos.usage) / 1024 ** 3 : 3.5,
      total: user?.photos?.limit ? Number(user.photos.limit) / 1024 ** 3 : 15,
      icon: Image,
      color: "bg-green-500",
    },
    {
      id: "mobile",
      name: "Mobile Backup",
      used: user?.mobile?.usage ? Number(user.mobile.usage) / 1024 ** 3 : 1.2,
      total: user?.mobile?.limit ? Number(user.mobile.limit) / 1024 ** 3 : 10,
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
                {totalUsed.toFixed(2)} GB of {totalStorage.toFixed(2)} GB used
              </span>
              <span className="text-gray-900 dark:text-white">
                {overallUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallUsage} className="h-3" />
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
                      {item.used.toFixed(2)} GB / {item.total.toFixed(2)} GB
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
