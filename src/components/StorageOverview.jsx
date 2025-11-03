import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { HardDrive, Mail, Image, Smartphone } from "lucide-react";

const storageData = [
  {
    id: "drive",
    name: "Google Drive",
    used: 45.2,
    total: 100,
    icon: HardDrive,
    color: "bg-blue-500",
  },
  {
    id: "gmail",
    name: "Gmail",
    used: 23.8,
    total: 100,
    icon: Mail,
    color: "bg-red-500",
  },
  {
    id: "photos",
    name: "Photos",
    used: 67.5,
    total: 100,
    icon: Image,
    color: "bg-green-500",
  },
  {
    id: "mobile",
    name: "Mobile Backup",
    used: 12.3,
    total: 100,
    icon: Smartphone,
    color: "bg-purple-500",
  },
];

 function StorageOverview() {
  const totalUsed = storageData.reduce((acc, item) => acc + item.used, 0);
  const totalStorage = storageData.reduce((acc, item) => acc + item.total, 0);
  const usagePercentage = (totalUsed / totalStorage) * 100;

  return (
    <div className="space-y-6">
      {/* Total Storage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {totalUsed.toFixed(1)} GB of {totalStorage} GB used
              </span>
              <span className="text-gray-900 dark:text-white">{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Storage Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {storageData.map((item) => {
          const Icon = item.icon;
          const percentage = (item.used / item.total) * 100;

          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${item.color} bg-opacity-10 dark:bg-opacity-20`}>
                      <Icon className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-gray-900 dark:text-white">{percentage.toFixed(0)}%</span>
                  </div>

                  <div>
                    <p className="text-gray-900 dark:text-white mb-1">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.used.toFixed(1)} GB / {item.total} GB
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