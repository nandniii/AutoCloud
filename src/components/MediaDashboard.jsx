import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, FileImage, FileVideo, FileText } from "lucide-react";

export default function MediaDashboard({ access_token: propToken }) {
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({});
  const [media, setMedia] = useState([]);
  const [error, setError] = useState(null);

  // ✅ Use prop token or fallback to localStorage
  const access_token =
    propToken ||
    JSON.parse(localStorage.getItem("user") || "{}")?.access_token;

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      if (!access_token) {
        setError("No access token found. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await axios.post("http://localhost:5000/api/dashboard", {
        access_token,
      });

      setQuota(res.data.quota);
      setMedia(res.data.media);
    } catch (err) {
      console.error("📛 DASHBOARD FETCH ERROR:", err.response?.data || err.message);

      if (err.response?.status === 401 || err.response?.data?.error === "Invalid Credentials") {
        setError("Your Google session expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Permission denied. Please ensure you granted Drive access.");
      } else {
        setError("Something went wrong while fetching your dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (mime) => {
    if (mime.startsWith("image/"))
      return <FileImage className="text-blue-500" />;
    if (mime.startsWith("video/"))
      return <FileVideo className="text-purple-500" />;
    return <FileText className="text-gray-500" />;
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;

    try {
      await axios.post("http://localhost:5000/api/cleanup/drive", {
        access_token,
        previewOnly: false,
        rules: [
          {
            enabled: true,
            pattern: "",
            condition: "type-is",
            value: id,
          },
        ],
      });

      setMedia((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete file");
    }
  };

  // 🌀 Loader
  if (loading)
    return <div className="text-center text-xl p-10">Loading dashboard...</div>;

  // ❌ Error message
  if (error)
    return (
      <div className="text-center text-red-600 text-lg p-10">
        {error}
      </div>
    );

  // ✅ Main UI
  return (
    <div className="p-6 space-y-6">
      {/* STORAGE SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Used", value: quota.totalUsageGB },
          { label: "Gmail", value: quota.gmailUsageGB },
          { label: "Photos", value: quota.photosUsageGB },
          { label: "Drive", value: quota.driveUsageGB },
          { label: "Total Limit", value: quota.totalLimitGB },
        ].map((item, index) => (
          <div key={index} className="bg-white shadow p-4 rounded-xl">
            <p className="text-gray-500">{item.label}</p>
            <p className="font-bold text-xl">
              {item?.value ? item.value.toFixed(2) : "0.00"} GB
            </p>
          </div>
        ))}
      </div>

      {/* MEDIA FILES */}
      <h2 className="text-2xl font-bold">Media Files</h2>

      {media.length === 0 ? (
        <p className="text-gray-500">No media files found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {media.map((file) => (
            <div
              key={file.id}
              className="bg-white p-4 shadow rounded-xl border flex items-center gap-4"
            >
              {getIcon(file.mimeType)}

              <div className="flex-1">
                <p className="font-semibold">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {file.sizeMB.toFixed(2)} MB
                </p>
                <a
                  href={file.previewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm underline"
                >
                  Preview
                </a>
              </div>

              <button
                onClick={() => deleteFile(file.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
