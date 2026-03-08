import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "Only http and https URLs are supported" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        Range: `bytes=0-${MAX_BYTES - 1}`,
        "User-Agent": "ffprobe-online/1.0",
      },
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json(
        { error: `Remote server returned ${response.status}` },
        { status: 502 }
      );
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
