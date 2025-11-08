import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { HardDrive, Mail, Image, Smartphone } from "lucide-react";

function StorageOverview({ user }) {
  const mongoUser = user || JSON.parse(localStorage.getItem("user")) || {};

  // ✅ Helper: Convert bytes to GB if needed
  const normalizeGB = (val) => {
    if (!val) return 0;
    // If > 1024, it's likely in bytes → convert to GB
    return val > 1024 ? val / (1024 ** 3) : val;
  };

  // ✅ Normalize all data
  const driveLimitGB = normalizeGB(mongoUser?.drive?.limit || 15);
  const driveUsedGB = normalizeGB(mongoUser?.drive?.usage || 0);

  const gmailLimitGB = normalizeGB(mongoUser?.gmail?.limit || 15);
  const gmailUsedGB = normalizeGB(mongoUser?.gmail?.usage || 0);

  const photosLimitGB = normalizeGB(mongoUser?.photos?.limit || 15);
  const photosUsedGB = normalizeGB(mongoUser?.photos?.usage || 0);

  const mobileLimitGB = normalizeGB(mongoUser?.mobileBackup?.limit || 10);
  const mobileUsedGB = normalizeGB(mongoUser?.mobileBackup?.usage || 0);

  const totalUsed =
    driveUsedGB + gmailUsedGB + photosUsedGB + mobileUsedGB;
  const totalLimit =
    driveLimitGB + gmailLimitGB + photosLimitGB + mobileLimitGB;
  const overallUsage = (totalUsed / totalLimit) * 100;

  const storageData = [
    {
      id: "drive",
      name: "Google Drive",
      used: driveUsedGB,
      total: driveLimitGB,
      icon: HardDrive,
      color: "bg-blue-500",
    },
    {
      id: "gmail",
      name: "Gmail",
      used: gmailUsedGB,
      total: gmailLimitGB,
      icon: Mail,
      color: "bg-red-500",
    },
    {
      id: "photos",
      name: "Google Photos",
      used: photosUsedGB,
      total: photosLimitGB,
      icon: Image,
      color: "bg-green-500",
    },
    {
      id: "mobile",
      name: "Mobile Backup",
      used: mobileUsedGB,
      total: mobileLimitGB,
      icon: Smartphone,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ✅ Total Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Total Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {totalUsed.toFixed(2)} GB of {totalLimit.toFixed(2)} GB used
              </span>
              <span className="text-gray-900 dark:text-white">
                {overallUsage.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallUsage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* ✅ Individual Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storageData.map((item) => {
          const Icon = item.icon;
          const percentage = (item.used / item.total) * 100 || 0;

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
