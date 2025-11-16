# image_utils.py
import os
import cv2
import imagehash
from PIL import Image

# --- Check image blur (low-quality)
def detect_blur(image_path: str) -> float:
    try:
        img = cv2.imread(image_path)
        if img is None:
            return 0.0
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()
    except Exception:
        return 0.0


# --- Compute hash for duplicate detection
def get_image_hash(image_path: str) -> str:
    try:
        with Image.open(image_path) as img:
            return str(imagehash.phash(img))
    except Exception:
        return "ERROR"


# --- Folder scanning (run in thread, so it's async-safe)
def scan_folder_for_issues(folder_path: str):
    supported_ext = (".jpg", ".jpeg", ".png", ".bmp", ".webp")
    results = {"duplicates": [], "low_quality": [], "total_images": 0}

    if not os.path.exists(folder_path):
        return {"error": "❌ Folder not found."}

    hashes = {}
    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith(supported_ext):
                image_path = os.path.join(root, file)
                results["total_images"] += 1

                # Check duplicates
                h = get_image_hash(image_path)
                if h != "ERROR":
                    if h in hashes:
                        results["duplicates"].append({
                            "original": hashes[h],
                            "duplicate": image_path
                        })
                    else:
                        hashes[h] = image_path

                # Check for blur
                blur = detect_blur(image_path)
                if blur < 100:
                    results["low_quality"].append({
                        "file": image_path,
                        "blur_score": round(blur, 2)
                    })

    return results
