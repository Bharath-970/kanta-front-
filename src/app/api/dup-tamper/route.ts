import { NextRequest, NextResponse } from "next/server";

const API = process.env.DUP_TAMPER_URL ?? "http://localhost:8003";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${API}/analyze`, { method: "POST", body: formData });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Duplication/tampering service unavailable (port 8003)." }, { status: 503 });
  }
}
