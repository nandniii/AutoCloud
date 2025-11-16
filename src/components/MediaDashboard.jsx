import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, FileImage, FileVideo, FileText } from "lucide-react";

export default function MediaDashboard({ access_token }) {
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState({});
  const [media, setMedia] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/dashboard", {
        access_token,
      });

      setQuota(res.data.quota);
      setMedia(res.data.media);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (mime) => {
    if (mime.startsWith("image/")) return <FileImage className="text-blue-500" />;
    if (mime.startsWith("video/")) return <FileVideo className="text-purple-500" />;
    return <FileText className="text-gray-500" />;
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;

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

    setMedia(media.filter((f) => f.id !== id));
  };

  if (loading)
    return <div className="text-center text-xl p-10">Loading dashboard...</div>;

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
            <p className="font-bold text-xl">{item.value.toFixed(2)} GB</p>
          </div>
        ))}
      </div>

      {/* MEDIA FILES */}
      <h2 className="text-2xl font-bold">Media Files</h2>

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
    </div>
  );
}
