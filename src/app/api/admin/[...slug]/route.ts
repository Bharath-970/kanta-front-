import { NextRequest, NextResponse } from "next/server";

const FLASK_URL = process.env.FLASK_AUTH_URL ?? "http://localhost:5001";

// Whitelist of allowed admin paths
const ALLOWED_PATHS = /^(users|approve\/\d+|reject\/\d+|revoke\/\d+)$/;

async function proxy(req: NextRequest, slug: string[], method: string) {
  const path = slug.join("/");

  if (!ALLOWED_PATHS.test(path)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = `${FLASK_URL}/api/admin/${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const cookie = req.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;

  const init: RequestInit = { method, headers };
  if (method === "POST") {
    init.body = await req.text();
  }

  try {
    const flaskRes = await fetch(url, init);
    const data = await flaskRes.json();
    const res = NextResponse.json(data, { status: flaskRes.status });

    const setCookies = flaskRes.headers.getSetCookie?.() ?? [];
    setCookies.forEach((c) => res.headers.append("Set-Cookie", c));

    return res;
  } catch (err) {
    console.error("[admin-proxy] Flask unreachable:", err);
    return NextResponse.json(
      { error: "Auth service unavailable." },
      { status: 503 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(req, slug, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  return proxy(req, slug, "POST");
}
