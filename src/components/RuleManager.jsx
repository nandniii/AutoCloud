import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import {
  Trash2,
  Edit2,
  Plus,
  Save,
  X,
  Play,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

export default function RuleManager() {
  const [rules, setRules] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cleanupRules")) || [];
    } catch {
      return [];
    }
  });

  const [automationEnabled, setAutomationEnabled] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("automationEnabled")) || false;
    } catch {
      return false;
    }
  });

  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [previewFiles, setPreviewFiles] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(""); // ✅ show in UI

  const [formData, setFormData] = useState({
    name: "",
    pattern: "",
    condition: "older-than",
    value: "",
    action: "delete",
    enabled: true,
  });

  // Persist rules
  useEffect(() => {
    localStorage.setItem("cleanupRules", JSON.stringify(rules));
  }, [rules]);

  // Persist automation toggle
  useEffect(() => {
    localStorage.setItem(
      "automationEnabled",
      JSON.stringify(automationEnabled)
    );
  }, [automationEnabled]);

  // Save / Update rule
  const handleSaveRule = () => {
    if (!formData.name || !formData.pattern || !formData.value) {
      toast.error("Please fill all fields");
      return;
    }

    if (editingId) {
      setRules((prev) =>
        prev.map((rule) =>
          rule.id === editingId ? { ...rule, ...formData } : rule
        )
      );
      toast.success("Rule updated");
    } else {
      setRules((prev) => [...prev, { id: Date.now().toString(), ...formData }]);
      toast.success("Rule added");
    }

    resetForm();
  };

  const handleDeleteRule = (id) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.success("Rule deleted");
  };

  const handleEditRule = (rule) => {
    setEditingId(rule.id);
    setFormData(rule);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      pattern: "",
      condition: "older-than",
      value: "",
      action: "delete",
      enabled: true,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  // ==========================
  // ⭐ PREVIEW CLEANUP
  // ==========================
  const previewDriveCleanup = async (forceRefresh = false) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.access_token) return toast.error("Login first.");
      if (rules.length === 0)
        return toast.error("You must add at least one rule.");

      setLoadingPreview(true);
      toast.dismiss();

      const res = await axios.post("http://localhost:5000/api/cleanup/drive", {
        access_token: user.access_token,
        email: user.email,
        rules,
        previewOnly: true,
        forceRefresh,
      });

      const matched = res.data?.matchedFiles || [];
      setPreviewFiles(matched);
      setDeleteMessage("");
      setShowPreview(true);

      const msg = res.data.fromCache
        ? `⚡ Loaded from cache (${matched.length} files)`
        : `🔄 Fresh scan: ${matched.length} files found`;
      toast.success(msg);
    } catch (err) {
      console.error("Preview error:", err.response?.data || err.message);
      toast.error("Failed to preview cleanup");
    } finally {
      setLoadingPreview(false);
    }
  };

  // ==========================
  // ⭐ CONFIRM CLEANUP (Mock Delete)
  // ==========================
  const confirmDriveCleanup = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.access_token) return toast.error("Login first.");

      toast.loading("Deleting files...");

      const res = await axios.post("http://localhost:5000/api/cleanup/drive", {
        access_token: user.access_token,
        email: user.email,
        rules,
        previewOnly: false,
      });

      toast.dismiss();
      const deletedCount = res.data?.summary?.movedToBin || 0;

      // ✅ UI Message (not toast only)
      setDeleteMessage(
        `✅ ${deletedCount} file${
          deletedCount !== 1 ? "s" : ""
        } deleted successfully!`
      );

      // ✅ Update Cleanup History
      window.dispatchEvent(new Event("cleanup-history-updated"));

      // Clear preview but keep modal open
      setPreviewFiles([]);
    } catch (err) {
      toast.dismiss();
      console.error("Delete error:", err);
      toast.error("Failed to delete files");
    }
  };

  return (
    <div className="space-y-6">
      {/* Automation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Automation</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Badge variant={automationEnabled ? "default" : "secondary"}>
            {automationEnabled ? "Active" : "Paused"}
          </Badge>
          <Switch
            checked={automationEnabled}
            onCheckedChange={setAutomationEnabled}
          />
        </CardContent>
        <div className="px-6 pb-4 space-y-2">
          <Button
            onClick={() => previewDriveCleanup(false)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Play className="size-4 mr-2" /> Preview Drive Cleanup
          </Button>

          <Button
            onClick={() => previewDriveCleanup(true)}
            variant="outline"
            className="w-full"
          >
            <RefreshCcw className="size-4 mr-2" /> Force Rescan Drive
          </Button>
        </div>
      </Card>

      {/* Add/Edit Rule */}
      {!showAddForm ? (
        <Button onClick={() => setShowAddForm(true)} className="w-full">
          <Plus className="size-4 mr-2" /> Add Rule
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Rule" : "Add Rule"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label>Rule Name</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <Label>Pattern</Label>
            <Input
              value={formData.pattern}
              onChange={(e) =>
                setFormData({ ...formData, pattern: e.target.value })
              }
            />

            <Label>Condition</Label>
            <select
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              className="w-full p-2 rounded border bg-transparent"
            >
              <option value="older-than">Older Than (days)</option>
              <option value="larger-than">Larger Than (MB)</option>
              <option value="contains">Name Contains</option>
            </select>

            <Label>Value</Label>
            <Input
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
            />

            <Label>Action</Label>
            <select
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
              className="w-full p-2 rounded border bg-transparent"
            >
              <option value="delete">Delete</option>
              <option value="move">Move to Folder</option>
              <option value="mark">Mark Only</option>
            </select>

            <div className="flex gap-2">
              <Button onClick={handleSaveRule} className="flex-1">
                <Save className="size-4 mr-2" /> Save
              </Button>
              <Button variant="outline" onClick={resetForm}>
                <X className="size-4 mr-2" /> Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      {rules.length === 0 ? (
        <p className="text-sm text-gray-500 text-center">No rules created yet.</p>
      ) : (
        rules.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="space-y-2">
              <h3 className="font-semibold">{rule.name}</h3>
              <p className="text-sm text-gray-500">
                Pattern: {rule.pattern} <br />
                Condition: {rule.condition} = {rule.value} <br />
                Action: {rule.action}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditRule(rule)}
                >
                  <Edit2 className="size-4 mr-2" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteRule(rule.id)}
                >
                  <Trash2 className="size-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-[90%] max-w-2xl p-6">
            <h2 className="text-lg font-bold mb-4">
              Preview ({previewFiles.length} files)
            </h2>

            {deleteMessage && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded mb-4">
                <CheckCircle className="size-5" />
                <span>{deleteMessage}</span>
              </div>
            )}

            <div className="max-h-[400px] overflow-y-auto space-y-3">
              {previewFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB •{" "}
                      {file.modifiedTime
                        ? new Date(file.modifiedTime).toLocaleDateString()
                        : "Unknown Date"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4 gap-2">
              {deleteMessage ? (
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={confirmDriveCleanup}
                  >
                    Confirm Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loader Overlay */}
      {loadingPreview && (
        <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-white mb-4"></div>
          <p className="text-white text-sm">
            Scanning Drive... this may take a minute on first run.
          </p>
        </div>
      )}
    </div>
  );
}
