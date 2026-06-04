import io, base64, os, re, tempfile
import cv2
import numpy as np
import requests
from PIL import Image
from bs4 import BeautifulSoup
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from pyzbar.pyzbar import decode as pyzbar_decode
    PYZBAR_OK = True
except Exception:
    PYZBAR_OK = False

try:
    import pytesseract
    TESSERACT_OK = True
except Exception:
    TESSERACT_OK = False

app = FastAPI(title="Death Certificate QR Verification API")
app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:3000"],
    allow_methods=["*"], allow_headers=["*"])

def load_img(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def decode_qr(img_bgr):
    if PYZBAR_OK:
        pil = Image.fromarray(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB))
        decoded = pyzbar_decode(pil)
        if decoded:
            return decoded[0].data.decode("utf-8", errors="ignore")
    # Fallback: OpenCV QRCodeDetector
    detector = cv2.QRCodeDetector()
    data, _, _ = detector.detectAndDecode(img_bgr)
    return data if data else None

def ocr_text(img_bgr):
    if not TESSERACT_OK:
        return ""
    try:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        return pytesseract.image_to_string(gray, config="--psm 6")
    except Exception:
        return ""

def scrape_portal(url: str):
    headers = {"User-Agent": "Mozilla/5.0 (compatible; KantakaVerifier/1.0)"}
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")
        fields = []
        # Try table rows
        for row in soup.find_all("tr"):
            cols = row.find_all(["td", "th"])
            if len(cols) >= 2:
                k = cols[0].get_text(strip=True)
                v = cols[1].get_text(strip=True)
                if k and v:
                    fields.append({"field": k, "value": v})
        # Try definition lists
        if not fields:
            for dt, dd in zip(soup.find_all("dt"), soup.find_all("dd")):
                fields.append({"field": dt.get_text(strip=True), "value": dd.get_text(strip=True)})
        # Try label-value pairs
        if not fields:
            for el in soup.find_all(class_=re.compile(r"label|field|key", re.I)):
                nxt = el.find_next_sibling()
                if nxt:
                    fields.append({"field": el.get_text(strip=True), "value": nxt.get_text(strip=True)})
        return fields[:30]
    except Exception as e:
        return []

def cross_reference(ocr: str, portal_fields: list):
    results = []
    ocr_clean = ocr.lower().replace("\n", " ")
    for item in portal_fields:
        val = item["value"].strip()
        if len(val) < 2:
            continue
        matched = val.lower() in ocr_clean or any(
            part.lower() in ocr_clean
            for part in val.split()
            if len(part) > 3
        )
        results.append({
            "field": item["field"],
            "value": val,
            "found_in_ocr": matched,
            "status": "matched" if matched else "not_matched",
        })
    return results

@app.get("/health")
def health():
    return {"status": "ok", "pyzbar": PYZBAR_OK, "tesseract": TESSERACT_OK}

@app.post("/verify")
async def verify(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    data = await file.read()
    img = load_img(data)
    if img is None:
        raise HTTPException(400, "Could not decode image")

    # QR decode
    qr_url = decode_qr(img)

    # OCR
    ocr_text_raw = ocr_text(img)

    # Portal scrape
    portal_fields = []
    if qr_url:
        portal_fields = scrape_portal(qr_url)

    # Cross-reference
    matches = cross_reference(ocr_text_raw, portal_fields) if portal_fields else []

    all_matched = all(m["status"] == "matched" for m in matches) if matches else False
    match_count = sum(1 for m in matches if m["status"] == "matched")

    verdict = ("VERIFIED" if all_matched and matches
               else "DISCREPANCIES_FOUND" if matches
               else "NO_QR" if not qr_url
               else "QR_FOUND_NO_DATA")

    return JSONResponse({
        "verdict": verdict,
        "qr_url": qr_url,
        "ocr_text": ocr_text_raw[:500] if ocr_text_raw else None,
        "portal_fields": portal_fields,
        "cross_reference": matches,
        "match_count": match_count,
        "total_fields": len(matches),
        "all_matched": all_matched,
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8004)))
