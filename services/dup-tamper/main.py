import io, base64, os
import cv2
import numpy as np
import hashlib
from PIL import Image
import imagehash
from skimage.metrics import structural_similarity as ssim
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Duplication & Tampering Detection API")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:3000"],
    allow_methods=["*"], allow_headers=["*"])

def load_img(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def to_b64(img_bgr):
    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return base64.b64encode(buf).decode()

def sha256(img):
    return hashlib.sha256(img.tobytes()).hexdigest()

def phash_dist(img1, img2):
    h1 = imagehash.phash(Image.fromarray(cv2.cvtColor(img1, cv2.COLOR_BGR2RGB)))
    h2 = imagehash.phash(Image.fromarray(cv2.cvtColor(img2, cv2.COLOR_BGR2RGB)))
    return int(h1 - h2)

def ssim_score(img1, img2):
    r2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
    g1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(r2, cv2.COLOR_BGR2GRAY)
    score, _ = ssim(g1, g2, full=True)
    return round(float(score), 4)

def detect_tampering(img1, img2):
    r2 = cv2.resize(img2, (img1.shape[1], img1.shape[0]))
    g1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(r2, cv2.COLOR_BGR2GRAY)
    diff = cv2.absdiff(g1, g2)
    _, thresh = cv2.threshold(diff, 20, 255, cv2.THRESH_BINARY)
    kernel = np.ones((3, 3), np.uint8)
    thresh = cv2.dilate(thresh, kernel, iterations=2)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h, w = img1.shape[:2]
    regions, boxes = set(), []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 80:
            x, y, wc, hc = cv2.boundingRect(cnt)
            boxes.append([int(x), int(y), int(wc), int(hc)])
            cx, cy = x + wc // 2, y + hc // 2
            regions.add("Top-Left" if cx < w/2 and cy < h/2
                        else "Top-Right" if cx >= w/2 and cy < h/2
                        else "Bottom-Left" if cx < w/2 else "Bottom-Right")
    highlighted = r2.copy()
    for (x, y, wc, hc) in boxes:
        cv2.rectangle(highlighted, (x, y), (x+wc, y+hc), (0, 0, 255), 3)
    mask_rgb = cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)
    return list(regions), boxes, to_b64(highlighted), to_b64(mask_rgb)

@app.get("/health")
def health(): return {"status": "ok"}

@app.post("/analyze")
async def analyze(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    d1, d2 = await file1.read(), await file2.read()
    img1, img2 = load_img(d1), load_img(d2)
    if img1 is None or img2 is None:
        raise HTTPException(400, "Could not decode one or both images")

    hash1, hash2 = sha256(img1), sha256(img2)
    is_exact_duplicate = hash1 == hash2
    phash = phash_dist(img1, img2)
    similar = phash <= 25
    ssim_val = ssim_score(img1, img2) if similar and not is_exact_duplicate else None

    tampered_regions, boxes, highlighted_b64, mask_b64 = [], [], None, None
    if similar and not is_exact_duplicate:
        tampered_regions, boxes, highlighted_b64, mask_b64 = detect_tampering(img1, img2)

    verdict = ("EXACT_DUPLICATE" if is_exact_duplicate
               else "NOT_RELATED" if not similar
               else "TAMPERED" if tampered_regions
               else "SIMILAR_CLEAN")

    return JSONResponse({
        "verdict": verdict,
        "is_exact_duplicate": is_exact_duplicate,
        "phash_distance": phash,
        "similar": similar,
        "ssim_score": ssim_val,
        "tampered_regions": tampered_regions,
        "tampered_boxes": len(boxes),
        "highlighted_image": highlighted_b64,
        "mask_image": mask_b64,
        "hash1": hash1[:16] + "...",
        "hash2": hash2[:16] + "...",
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8003)))
