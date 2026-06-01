import { NextRequest, NextResponse } from "next/server";

const API = process.env.QR_VERIFY_URL ?? "http://localhost:8004";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${API}/verify`, { method: "POST", body: formData });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "QR verification service unavailable (port 8004)." }, { status: 503 });
  }
}
