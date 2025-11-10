import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { HardDrive, Mail, Image, Smartphone } from "lucide-react";

function StorageOverview({ user }) {
  // ✅ Always show latest user data
  const savedUser = JSON.parse(localStorage.getItem("user")) || {};
  const mongoUser = user || savedUser || {};

  const num = (v) => (typeof v === "number" && !isNaN(v) ? v : 0);

  const sharedUsed = num(mongoUser.totalUsageGB);
  const sharedLimit = num(mongoUser.totalLimitGB) || 15;
  const mobileUsed = num(mongoUser.mobileBackup?.usage) || 0.5;
  const mobileLimit = num(mongoUser.mobileBackup?.limit) || 10;
  const totalUsed = sharedUsed + mobileUsed;
  const totalLimit = sharedLimit + mobileLimit;
  const sharedPercent = (sharedUsed / sharedLimit) * 100;

  console.log("📦 Using totalUsageGB from backend:", sharedUsed, "of", sharedLimit);

  // 🔹 Prepare storage cards dynamically
  const storageData = [
    {
      id: "drive",
      name: "Google Drive",
      used: num(mongoUser.drive?.usage),
      total: sharedLimit,
      icon: HardDrive,
      color: "#3B82F6",
    },
    {
      id: "gmail",
      name: "Gmail",
      used: num(mongoUser.gmail?.usage),
      total: sharedLimit,
      icon: Mail,
      color: "#EF4444",
    },
    {
      id: "photos",
      name: "Google Photos",
      used: num(mongoUser.photos?.usage),
      total: sharedLimit,
      icon: Image,
      color: "#10B981",
    },
    {
      id: "mobile",
      name: "Mobile Backup",
      used: mobileUsed,
      total: mobileLimit,
      icon: Smartphone,
      color: "#A855F7",
    },
  ];

  // 🔹 Filter out Gmail/Photos cards with 0 usage (API didn’t return)
  const visibleData = storageData.filter((item) => item.used > 0);

  return (
    <div className="space-y-6">
      {/* Shared Storage Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Google Shared Storage (Drive + Gmail + Photos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {sharedUsed.toFixed(2)} GB of {sharedLimit.toFixed(2)} GB used
              </span>
              <span className="text-gray-900 dark:text-white">
                {sharedPercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={sharedPercent} className="h-3" />
          </div>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Total (including mobile backup):{" "}
            {totalUsed.toFixed(2)} GB of {totalLimit.toFixed(2)} GB used
          </div>

          <div className="mt-2 text-xs text-gray-400">
            Last synced:{" "}
            {mongoUser.updatedAt
              ? new Date(mongoUser.updatedAt).toLocaleString()
              : "N/A"}
          </div>
        </CardContent>
      </Card>

      {/* Individual Service Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleData.map((item) => {
          const Icon = item.icon;
          const pct = (item.used / item.total) * 100 || 0;

          return (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow dark:bg-gray-900"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span className="text-gray-900 dark:text-white">
                      {pct.toFixed(0)}%
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
                  <Progress value={pct} className="h-2" />
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
