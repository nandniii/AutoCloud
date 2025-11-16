import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Undo2, Trash2 } from "lucide-react";
import { toast } from "sonner";

function formatSize(bytes) {
  if (!bytes) return "0 MB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function CleanupHistory() {
  const [history, setHistory] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  // 🚨 Avoid crash if user does not exist
  const loadHistory = async () => {
    if (!user?.email) {
      console.log("⚠️ No user found — cannot fetch history");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/history", {
        email: user.email,
      });

      console.log("📦 History loaded:", res.data);

      setHistory(res.data.history || []);
    } catch (err) {
      console.error("❌ History fetch error:", err);
      toast.error("Failed to load cleanup history");
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ⭐ RESTORE FILE
  const restoreFile = async (item) => {
    try {
      toast.loading("Restoring file...");

      const res = await axios.post("http://localhost:5000/api/bin/restore", {
        fileId: item.fileId,
        access_token: item.accessToken || user?.access_token,
      });

      toast.dismiss();

      if (res.data.restored) {
        toast.success("File restored successfully!");
      } else {
        toast.error(res.data.message || "Could not restore this file");
      }

      loadHistory();
    } catch (err) {
      toast.dismiss();
      console.error("❌ Restore failed:", err);
      toast.error("This file cannot be restored");
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">Cleanup History</h3>

          <Badge variant="outline" className="bg-green-50 text-green-700">
            Successfully Deleted
          </Badge>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {history.length === 0 && (
            <p className="text-center text-gray-500">
              No deleted files found.
            </p>
          )}

          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0"
            >
              <div className="p-2 bg-gray-100 rounded-lg mt-1">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className="font-medium">{item.name}</p>

                  <Badge variant="secondary">{formatSize(item.sizeBytes)}</Badge>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {formatDate(item.date)} • Google Drive
                </p>
              </div>

              {/* ⭐ Restore Button */}
              <button
                onClick={() => restoreFile(item)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Undo2 size={16} />
                Restore
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="mt-6 pt-6 border-t text-sm">
          <div className="flex justify-between">
            <p>Total items deleted:</p>
            <p className="font-semibold">{history.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
