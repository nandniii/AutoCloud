import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, Trash2, Archive, FileText, Image } from "lucide-react";

const history = [
  {
    id: 1,
    action: "Deleted duplicate files",
    date: "2025-11-02",
    time: "14:32",
    source: "Google Drive",
    amount: "2.4 GB",
    status: "completed",
    icon: Trash2,
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    id: 2,
    action: "Archived old emails",
    date: "2025-11-01",
    time: "09:15",
    source: "Gmail",
    amount: "1.2 GB",
    status: "completed",
    icon: Archive,
    color: "text-red-600 dark:text-red-400",
  },
  {
    id: 3,
    action: "Optimized photo quality",
    date: "2025-10-28",
    time: "16:45",
    source: "Photos",
    amount: "3.8 GB",
    status: "completed",
    icon: Image,
    color: "text-green-600 dark:text-green-400",
  },
  {
    id: 4,
    action: "Removed old backups",
    date: "2025-10-25",
    time: "11:20",
    source: "Mobile",
    amount: "4.5 GB",
    status: "completed",
    icon: Trash2,
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    id: 5,
    action: "Cleaned temporary files",
    date: "2025-10-20",
    time: "08:30",
    source: "Google Drive",
    amount: "0.9 GB",
    status: "completed",
    icon: FileText,
    color: "text-blue-600 dark:text-blue-400",
  },
];

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date("2025-11-03");
  const yesterday = new Date("2025-11-02");

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

 function CleanupHistory() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-gray-900 dark:text-white">Recent Activity</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            All successful
          </Badge>
        </div>

        <div className="space-y-3">
          {history.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div className={`p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mt-1 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-gray-900 dark:text-white">{item.action}</p>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {item.amount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(item.date)}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                    <span>•</span>
                    <span>{item.source}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total cleaned this month:</p>
            <p className="text-gray-900 dark:text-white">12.8 GB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default CleanupHistory;