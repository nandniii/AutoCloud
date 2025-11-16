from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from image_utils import scan_folder_for_issues
import os

# ✅ Initialize FastAPI app
app = FastAPI(title="AutoCloud AI Cleanup Engine", version="1.0")

# ✅ Allow frontend & Node backend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all origins (you can restrict to localhost:5173 later)
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# 📦 Pydantic Model
# ------------------------------
class FolderRequest(BaseModel):
    folder_path: str
    auto_cleanup: bool = False


# ------------------------------
# 🧠 Root Route
# ------------------------------
@app.get("/")
def root():
    return {"message": "✅ AutoCloud Cleanup Engine Active"}


# ------------------------------
# 🧩 Folder Scan + Auto Cleanup Endpoint
# ------------------------------
@app.post("/api/scan-folder")
async def scan_folder(req: FolderRequest):
    folder = req.folder_path.strip()

    # 🚨 Validate folder path
    if not folder or not os.path.exists(folder):
        return {"error": f"❌ Folder not found: {folder}"}

    # 🧠 Run image scanning (duplicates + blur detection)
    result = scan_folder_for_issues(folder)

    # 🔧 If auto_cleanup is True, delete duplicate files
    deleted_files = []
    if req.auto_cleanup and "duplicates" in result:
        for issue in result["duplicates"]:
            duplicate_path = issue.get("duplicate")
            if duplicate_path and os.path.exists(duplicate_path):
                try:
                    os.remove(duplicate_path)
                    deleted_files.append(duplicate_path)
                except Exception as e:
                    print(f"⚠️ Error deleting {duplicate_path}: {e}")

        result["deleted_files"] = deleted_files

    # 🧾 Return a clear, structured summary
    total_images = result.get("total_images", 0)
    duplicates = len(result.get("duplicates", []))
    low_quality = len(result.get("low_quality", []))

    return {
        "summary": {
            "total_images": total_images,
            "duplicates_found": duplicates,
            "low_quality_found": low_quality,
            "deleted_files": len(deleted_files),
        },
        "details": result,
    }


# ------------------------------
# ⚡ Simple Health Check Endpoint
# ------------------------------
@app.get("/api/health")
def health_check():
    """Quick health check for Node.js or monitoring"""
    return {"status": "ok", "engine": "AutoCloud AI Cleanup", "active": True}
