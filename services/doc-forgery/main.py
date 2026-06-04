import io, base64, warnings, os
import cv2
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw, ImageChops
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import DBSCAN
from skimage.feature import local_binary_pattern
from dataclasses import dataclass, field
from typing import List
import imagehash

try:
    import pytesseract
    TESSERACT_OK = True
except ImportError:
    TESSERACT_OK = False

warnings.filterwarnings("ignore")

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Doc Forgery Detection API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ─────────────────────────────────────────────────────────────────

def _bgr_to_b64(img_bgr):
    _, buf = cv2.imencode(".jpg", img_bgr, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return base64.b64encode(buf).decode()

def _pil_to_b64(img_pil):
    buf = io.BytesIO()
    img_pil.convert("RGB").save(buf, "JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode()

def _load_bgr(data: bytes):
    arr = np.frombuffer(data, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

# ── C1: Copy-Paste ──────────────────────────────────────────────────────────

def _entropy(block):
    hist = np.histogram(block, bins=256)[0]
    hist = hist / (hist.sum() + 1e-6)
    return -np.sum(hist * np.log2(hist + 1e-6))

def _compute_ncc(a, b):
    a = cv2.resize(a, (32, 32)).astype(np.float32)
    b = cv2.resize(b, (32, 32)).astype(np.float32)
    a -= a.mean(); b -= b.mean()
    return np.mean(a * b) / (a.std() * b.std() + 1e-6)

def _texture_sim(a, b):
    lbp1 = local_binary_pattern(a, 8, 1)
    lbp2 = local_binary_pattern(b, 8, 1)
    return 1 - np.linalg.norm(lbp1 - lbp2) / 1000

def detect_c1(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    edges = cv2.Canny(gray, 50, 150)
    block_size, step = 16, 12
    features, coords, blocks = [], [], []
    for y in range(0, gray.shape[0] - block_size, step):
        for x in range(0, gray.shape[1] - block_size, step):
            block = gray[y:y+block_size, x:x+block_size]
            if _entropy(block) < 2.5: continue
            if np.mean(edges[y:y+block_size, x:x+block_size]) < 0.02: continue
            dct = cv2.dct(np.float32(block))[:4, :4].flatten()
            features.append(dct); coords.append((x, y)); blocks.append(block)
    features = np.array(features)
    matches = []
    if len(features) > 0:
        nbrs = NearestNeighbors(n_neighbors=min(8, len(features))).fit(features)
        distances, indices = nbrs.kneighbors(features)
        for i in range(len(features)):
            x1, y1 = coords[i]
            for k in range(1, min(8, len(features))):
                j = indices[i][k]
                x2, y2 = coords[j]
                if abs(y1 - y2) < 20: continue
                if np.linalg.norm([x1-x2, y1-y2]) < 30: continue
                if distances[i][k] < 12:
                    ncc = _compute_ncc(blocks[i], blocks[j])
                    tex = _texture_sim(blocks[i], blocks[j])
                    if ncc < 0.6: continue
                    score = 0.4*(1-distances[i][k]/12) + 0.3*ncc + 0.3*tex
                    matches.append((x1, y1, x2, y2, score))
    orb = cv2.ORB_create(3000)
    kp, des = orb.detectAndCompute(gray, None)
    if des is not None:
        bf = cv2.BFMatcher(cv2.NORM_HAMMING)
        raw = bf.knnMatch(des, des, k=2)
        for m, n in raw:
            if m.distance < 0.75 * n.distance:
                p1 = kp[m.queryIdx].pt; p2 = kp[m.trainIdx].pt
                if np.linalg.norm(np.array(p1) - np.array(p2)) < 30: continue
                matches.append((int(p1[0]), int(p1[1]), int(p2[0]), int(p2[1]), 0.7))
    text_groups = {}
    if TESSERACT_OK:
        try:
            data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
            for i in range(len(data["text"])):
                txt = data["text"][i].strip()
                if txt:
                    x, y, w, h = data["left"][i], data["top"][i], data["width"][i], data["height"][i]
                    text_groups.setdefault(txt, []).append((x, y, w, h))
        except: pass
    mask = np.zeros(gray.shape, dtype=np.uint8)
    for (x1, y1, x2, y2, _) in matches:
        xp, yp = (x2, y2) if y2 > y1 else (x1, y1)
        cv2.rectangle(mask, (xp, yp), (xp+20, yp+20), 255, -1)
    for txt, bxs in text_groups.items():
        if len(bxs) > 1:
            for x, y, w, h in bxs[1:]:
                cv2.rectangle(mask, (x, y), (x+w, y+h), 255, -1)
    points = np.column_stack(np.where(mask > 0))
    if len(points) > 0:
        clustering = DBSCAN(eps=25, min_samples=4).fit(points)
        labels = clustering.labels_
        clean_mask = np.zeros_like(mask)
        for label in set(labels):
            if label == -1: continue
            for (y, x) in points[labels == label]:
                clean_mask[y, x] = 255
        mask = clean_mask
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        if w*h < 200: continue
        if w*h > 0.3 * gray.shape[0] * gray.shape[1]: continue
        boxes.append((x, y, w, h))
    out = img_bgr.copy()
    for (x, y, w, h) in boxes:
        cv2.rectangle(out, (x, y), (x+w, y+h), (0, 0, 255), 2)
        cv2.putText(out, "C1", (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
    return out, len(boxes)

# ── C3: Added Content ────────────────────────────────────────────────────────

def detect_c3(img_bgr):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    bin_img = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 35, 10)
    kernel_text = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    text_lines = cv2.morphologyEx(bin_img, cv2.MORPH_OPEN, kernel_text)
    cleaned = cv2.subtract(bin_img, text_lines)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 500: continue
        x, y, w, h = cv2.boundingRect(cnt)
        aspect = w / (h + 1e-6)
        roi = cleaned[y:y+h, x:x+w]
        fill_ratio = np.sum(roi > 0) / (w * h)
        edges = cv2.Canny(roi, 50, 150)
        edge_density = np.sum(edges > 0) / (w * h)
        peri = cv2.arcLength(cnt, True)
        circularity = 4*np.pi*area / (peri*peri + 1e-6) if peri > 0 else 0
        label = None
        if circularity > 0.2 and fill_ratio > 0.08 and w > 40 and h > 40:
            label = "stamp"
        elif aspect > 2.0 and fill_ratio < 0.25 and edge_density > 0.02:
            label = "signature"
        if label:
            detections.append({"type": label, "x": int(x), "y": int(y), "w": int(w), "h": int(h)})
    colors = {"stamp": (0, 255, 0), "signature": (255, 0, 0)}
    out = img_bgr.copy()
    for det in detections:
        x, y, w, h = det["x"], det["y"], det["w"], det["h"]
        color = colors.get(det["type"], (0, 165, 255))
        cv2.rectangle(out, (x, y), (x+w, y+h), color, 2)
        cv2.putText(out, f"C3:{det['type']}", (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
    return out, len(detections)

# ── C4: Erasure ──────────────────────────────────────────────────────────────

@dataclass
class ErasureRegion:
    x: int; y: int; w: int; h: int
    type: str = "erased"; score: float = 0.0; source: str = ""; signals: dict = field(default_factory=dict)

CFG_C4 = dict(
    max_dim=2200, s1_context_pad=41, s1_smooth_pct=40, s1_min_area=60, s1_min_dim=4,
    s2_dct_ratio_thr=0.05, s3_border_ratio_thr=2.5, s3_border_px=2, s4_lap_ratio_thr=0.5,
    s5_gap_median_mult=1.5, s5_gap_min_abs=8, s5_gap_token_mult=0.4,
    score_threshold=1.5, min_region_area=50, min_region_dim=4,
    box_color=(220, 50, 50), label_color=(255, 255, 255), box_thickness=3,
)

def _texture_maps(gray):
    gf = gray.astype(np.float32)
    residual = np.abs(gf - cv2.GaussianBlur(gf, (0,0), 3.0))
    mean = cv2.blur(gf, (31,31))
    variance = np.maximum(cv2.blur(gf*gf,(31,31)) - mean*mean, 0.0)
    gx = cv2.Sobel(gf, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gf, cv2.CV_32F, 0, 1, ksize=3)
    gradient = np.sqrt(gx**2 + gy**2)
    return residual, variance, gradient

def _text_mask_c4(gray):
    blur = cv2.GaussianBlur(gray, (3,3), 0)
    mask = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY_INV, 31, 10)
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    return cv2.morphologyEx(mask, cv2.MORPH_OPEN, k, iterations=1)

def _box_mean(arr, x1, y1, x2, y2):
    c = arr[y1:y2, x1:x2]; return float(np.mean(c)) if c.size else 0.0

def _ring_mean(arr, x1, y1, x2, y2, pad):
    H, W = arr.shape[:2]
    ox1,oy1 = max(0,x1-pad), max(0,y1-pad)
    ox2,oy2 = min(W,x2+pad), min(H,y2+pad)
    outer = arr[oy1:oy2, ox1:ox2]; inner = arr[y1:y2, x1:x2]
    rc = outer.size - inner.size
    return float((outer.sum()-inner.sum())/rc) if rc > 0 else float(np.mean(outer))

def _dct_ac(patch, bs=8):
    p = patch.astype(np.float32); ph, pw = p.shape; energies=[]
    for yy in range(0,ph-bs+1,bs):
        for xx in range(0,pw-bs+1,bs):
            blk = p[yy:yy+bs,xx:xx+bs]-128.0
            d = cv2.dct(blk); energies.append(float(np.sum(d[1:,1:]**2)))
    return float(np.mean(energies)) if energies else 0.0

def _stage1_smooth(gray, mask, residual, variance, gradient, cfg):
    foreground=(mask>0).astype(np.uint8)
    if not np.any(foreground): return []
    k=cfg["s1_context_pad"]
    ctx_kern=cv2.getStructuringElement(cv2.MORPH_RECT,(k,k))
    ctx=cv2.dilate(foreground,ctx_kern,iterations=1)
    interior=cv2.subtract(ctx,foreground)
    ctx_idx=ctx>0
    if not np.any(ctx_idx): return []
    pct=cfg["s1_smooth_pct"]
    var_thr=float(np.percentile(variance[ctx_idx],pct))
    grd_thr=float(np.percentile(gradient[ctx_idx],pct))
    res_thr=float(np.percentile(residual[ctx_idx],pct))
    cm=((interior>0)&(variance<=var_thr)&(gradient<=grd_thr)&(residual<=res_thr)).astype(np.uint8)
    cm=cv2.morphologyEx(cm,cv2.MORPH_OPEN,cv2.getStructuringElement(cv2.MORPH_RECT,(5,5)))
    cm=cv2.morphologyEx(cm,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_RECT,(7,7)))
    contours,_=cv2.findContours(cm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
    out=[]
    for cnt in contours:
        x,y,w,h=cv2.boundingRect(cnt)
        if w*h<cfg["s1_min_area"]: continue
        if w<cfg["s1_min_dim"] or h<cfg["s1_min_dim"]: continue
        out.append(((x,y,x+w,y+h),"smooth_region"))
    return out

def _score_candidate(img_bgr, gray, residual, variance, gradient, box, cfg):
    x1,y1,x2,y2=box; H,W=gray.shape
    if x2<=x1 or y2<=y1: return 0.0
    pad=max(12,min(30,max(x2-x1,y2-y1)//2))
    int_res=_box_mean(residual,x1,y1,x2,y2)
    ring_res=_ring_mean(residual,x1,y1,x2,y2,pad)
    s_noise=1.0 if (ring_res>1e-4 and int_res<ring_res*0.30) else 0.0
    int_var=_box_mean(variance,x1,y1,x2,y2)
    ring_var=_ring_mean(variance,x1,y1,x2,y2,pad)
    s_var=1.0 if (ring_var>1e-4 and int_var<ring_var*0.45) else 0.0
    int_grad=_box_mean(gradient,x1,y1,x2,y2)
    bp=cfg["s3_border_px"]
    bpix=(gradient[y1:min(y1+bp,y2),x1:x2].flatten().tolist()+
          gradient[max(y2-bp,y1):y2,x1:x2].flatten().tolist()+
          gradient[y1:y2,x1:min(x1+bp,x2)].flatten().tolist()+
          gradient[y1:y2,max(x2-bp,x1):x2].flatten().tolist())
    brd_grad=float(np.mean(bpix)) if bpix else 0.0
    ratio_g=brd_grad/max(int_grad,1e-6)
    s_border=0.75 if ratio_g>=cfg["s3_border_ratio_thr"] else 0.0
    lap=cv2.Laplacian(gray,cv2.CV_32F)
    int_lv=float(np.var(lap[y1:y2,x1:x2]))
    rx1,ry1,rx2,ry2=max(0,x1-pad),max(0,y1-pad),min(W,x2+pad),min(H,y2+pad)
    ctx_lv=float(np.var(lap[ry1:ry2,rx1:rx2]))
    s_lap=0.5 if (ctx_lv>1e-4 and int_lv<ctx_lv*cfg["s4_lap_ratio_thr"]) else 0.0
    patch=gray[y1:y2,x1:x2]
    int_dct=_dct_ac(patch)
    ring_dct=_dct_ac(gray[ry1:ry2,rx1:rx2])
    s_dct=0.75 if (ring_dct>1 and int_dct<ring_dct*cfg["s2_dct_ratio_thr"]) else 0.0
    return s_noise+s_var+s_border+s_lap+s_dct

def detect_c4(img_bgr):
    cfg=CFG_C4
    gray=cv2.cvtColor(img_bgr,cv2.COLOR_BGR2GRAY)
    residual,variance,gradient=_texture_maps(gray)
    mask=_text_mask_c4(gray)
    candidates=_stage1_smooth(gray,mask,residual,variance,gradient,cfg)
    regions,seen=[],set()
    for box,src in candidates:
        x1,y1,x2,y2=box
        H,W=gray.shape
        x1,y1,x2,y2=max(0,x1),max(0,y1),min(W,x2),min(H,y2)
        key=(x1//4,y1//4,x2//4,y2//4)
        if key in seen: continue
        seen.add(key)
        if (x2-x1)*(y2-y1)<cfg["min_region_area"]: continue
        sc=_score_candidate(img_bgr,gray,residual,variance,gradient,(x1,y1,x2,y2),cfg)
        if sc<cfg["score_threshold"]: continue
        regions.append(ErasureRegion(x=x1,y=y1,w=x2-x1,h=y2-y1,score=round(sc,3),source=src))
    out=img_bgr.copy()
    H,W=out.shape[:2]
    font=cv2.FONT_HERSHEY_SIMPLEX
    fs=max(0.35,min(0.9,W/1800)); ft=2
    for i,r in enumerate(regions):
        x1,y1=r.x,r.y; x2,y2=min(r.x+r.w,W),min(r.y+r.h,H)
        cv2.rectangle(out,(x1,y1),(x2,y2),(50,50,220),3)
        cv2.putText(out,f"C4 #{i+1}",(x1,max(y1-5,10)),font,fs,(255,255,255),ft)
    return out, len(regions)

# ── C5: Content Merging ──────────────────────────────────────────────────────

N_ZONES=16; COLOR_DIFF_THRESH=18.0; FORGED_THRESH=0.28; SUSPICIOUS_THRESH=0.15
C5_COLOR_THRESH=55.0; DOC_MIN_BRIGHTNESS=85.0; DOC_BRIGHT_FRAC=0.18

def _zone_doc_mask(arr,n):
    H=arr.shape[0]; mask=[]
    for i in range(n):
        y0=i*H//n; y1=(i+1)*H//n if i<n-1 else H
        band=arr[y0:y1].astype(np.float32); bright=band.mean(axis=2)
        mask.append(bright.mean()>=DOC_MIN_BRIGHTNESS and (bright>DOC_MIN_BRIGHTNESS).mean()>=DOC_BRIGHT_FRAC)
    return np.array(mask,dtype=bool)

def _zone_backgrounds(arr,n):
    H=arr.shape[0]; zones=[]
    for i in range(n):
        y0=i*H//n; y1=(i+1)*H//n if i<n-1 else H
        band=arr[y0:y1].astype(np.float32); bright=band.mean(axis=2)
        mask=bright>np.percentile(bright,70)
        bg=band[mask] if mask.sum()>=50 else band.reshape(-1,3)
        zones.append(bg.mean(axis=0))
    return np.array(zones,dtype=np.float32)

def _ela_zones(img_pil,n,quality=90):
    buf=io.BytesIO(); img_pil.convert("RGB").save(buf,"JPEG",quality=quality); buf.seek(0)
    resaved=Image.open(buf).convert("RGB")
    diff=np.array(ImageChops.difference(img_pil.convert("RGB"),resaved),dtype=np.float32)
    H=diff.shape[0]
    return np.array([diff[i*H//n:(i+1)*H//n if i<n-1 else H].mean() for i in range(n)],dtype=np.float32)

def _splice_transitions(zone_bg,doc_mask,mean_bright):
    n=len(zone_bg); dists=[]
    for i in range(n-1):
        if doc_mask[i] and doc_mask[i+1]: dists.append(float(np.linalg.norm(zone_bg[i]-zone_bg[i+1])))
        else: dists.append(0.0)
    doc_d=[d for i,d in enumerate(dists) if i<n-1 and doc_mask[i] and doc_mask[i+1] and d>0]
    median_j=float(np.median(doc_d)) if doc_d else 0.0
    base=12.0 if mean_bright>200 else 20.0
    thresh=max(base,2.0*median_j)
    return dists,[i for i,d in enumerate(dists) if d>thresh]

def detect_c5(img_bgr):
    img_pil=Image.fromarray(cv2.cvtColor(img_bgr,cv2.COLOR_BGR2RGB))
    arr=np.array(img_pil,dtype=np.float32); H,W=arr.shape[:2]
    n=N_ZONES; zone_h=H//n; mean_brightness=float(arr.mean())
    doc_mask=_zone_doc_mask(arr,n); zone_bg=_zone_backgrounds(arr,n)
    ela=_ela_zones(img_pil,n)
    dists,splice_idxs=_splice_transitions(zone_bg,doc_mask,mean_brightness)
    doc_idx=[i for i in range(n) if doc_mask[i]]
    max_dist=max((float(np.linalg.norm(zone_bg[i]-zone_bg[j])) for i in doc_idx for j in doc_idx if i<j),default=0.0)
    doc_d=[d for i,d in enumerate(dists) if i<n-1 and doc_mask[i] and doc_mask[i+1] and d>0]
    mean_j=float(np.mean(doc_d)) if doc_d else 0.0
    s1=min(max_dist/120.0,1.0); s2=min(mean_j/22.0,1.0); s4=min(len(splice_idxs)/5.0,1.0)
    s5=0.0
    if doc_idx:
        doc_ela=ela[doc_idx]; ela_mean=doc_ela.mean()
        if ela_mean>0: s5=min((doc_ela.max()-ela_mean)/(ela_mean+1e-6)/3.0,1.0)
    composite=0.28*s1+0.24*s2+0.12*s4+0.14*s5
    if composite>FORGED_THRESH: verdict="FORGED"
    elif composite>SUSPICIOUS_THRESH: verdict="SUSPICIOUS"
    else: verdict="AUTHENTIC"
    draw=ImageDraw.Draw(img_pil)
    bboxes=[]
    if verdict in ("FORGED","SUSPICIOUS"):
        for idx in splice_idxs:
            y0=idx*zone_h; y1=min((idx+2)*zone_h,H)
            color="purple" if composite>FORGED_THRESH else "orange"
            draw.rectangle([0,y0,W,y1],outline=color,width=3)
            draw.text((6,max(y0-18,2)),f"C5 splice",fill=color)
            bboxes.append({"y0":y0,"y1":y1})
    out=cv2.cvtColor(np.array(img_pil),cv2.COLOR_RGB2BGR)
    return out, verdict, round(composite,3), len(bboxes)

# ── API ──────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "tesseract": TESSERACT_OK}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(413, "Image too large (max 20MB)")
    img = _load_bgr(data)
    if img is None:
        raise HTTPException(400, "Could not decode image")

    categories = []
    annotated = img.copy()
    details = {}

    try:
        out_c1, count_c1 = detect_c1(img)
        if count_c1 > 0:
            categories.append("C1")
            annotated = out_c1
            details["C1"] = {"regions": count_c1, "label": "Copy-Paste"}
    except Exception as e:
        details["C1_error"] = str(e)

    try:
        out_c3, count_c3 = detect_c3(annotated)
        if count_c3 > 0:
            categories.append("C3")
            annotated = out_c3
            details["C3"] = {"regions": count_c3, "label": "Added Content"}
    except Exception as e:
        details["C3_error"] = str(e)

    try:
        out_c4, count_c4 = detect_c4(annotated)
        if count_c4 > 0:
            categories.append("C4")
            annotated = out_c4
            details["C4"] = {"regions": count_c4, "label": "Erasure"}
    except Exception as e:
        details["C4_error"] = str(e)

    try:
        out_c5, verdict_c5, score_c5, count_c5 = detect_c5(annotated)
        if verdict_c5 in ("FORGED", "SUSPICIOUS"):
            categories.append("C5")
            annotated = out_c5
            details["C5"] = {"verdict": verdict_c5, "score": score_c5, "label": "Content Merging"}
    except Exception as e:
        details["C5_error"] = str(e)

    if not categories:
        categories = ["C10"]
        details["C10"] = {"label": "No Forgery Detected"}

    return JSONResponse({
        "categories": categories,
        "details": details,
        "annotated_image": _bgr_to_b64(annotated),
        "filename": file.filename,
    })

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
