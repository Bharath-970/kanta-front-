import { NextRequest, NextResponse } from "next/server";

const FORGERY_URL = process.env.FORGERY_API_URL ?? "http://localhost:8002";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${FORGERY_URL}/detect`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Forgery detection service unavailable. Make sure it is running on port 8002." },
      { status: 503 }
    );
  }
}
