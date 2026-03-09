import { NextRequest, NextResponse } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const FETCH_TIMEOUT_MS = 15_000; // 15 seconds

// SSRF protection — block private/reserved IP ranges
function isPrivateHost(hostname: string): boolean {
  if (hostname === "localhost") return true;
  if (hostname === "::1" || hostname === "[::1]") return true;

  const parts = hostname.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => p >= 0 && p <= 255)) {
    const [a, b] = parts;
    if (a === 127) return true;                       // 127.x.x.x loopback
    if (a === 10) return true;                        // 10.x.x.x private
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16–31.x.x private
    if (a === 192 && b === 168) return true;           // 192.168.x.x private
    if (a === 169 && b === 254) return true;           // 169.254.x.x link-local / AWS metadata
    if (a === 0) return true;                          // 0.x.x.x unspecified
  }

  return false;
}

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

  // Block private/internal addresses
  if (isPrivateHost(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: "Private and local addresses are not allowed" },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
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

    // Reject early if Content-Length already exceeds the cap
    const contentLength = parseInt(response.headers.get("content-length") ?? "0", 10);
    if (contentLength > MAX_BYTES) {
      return NextResponse.json(
        { error: "Remote file exceeds the 10 MB limit" },
        { status: 413 }
      );
    }

    // Stream the body and enforce a hard byte cap
    const reader = response.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: "No response body" }, { status: 502 });
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_BYTES) {
        reader.cancel();
        return NextResponse.json(
          { error: "Remote file exceeds the 10 MB limit" },
          { status: 413 }
        );
      }
      chunks.push(value);
    }

    // Combine chunks into a single buffer
    const buffer = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      buffer.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timed out" }, { status: 504 });
    }
    const msg = err instanceof Error ? err.message : "Failed to fetch URL";
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}
