"use client";

import { useRef, useState } from "react";
import { parseFFmpegLog, ProbeResult } from "./parse-probe";

export type ProbeStatus = "idle" | "loading" | "analyzing" | "done" | "error";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const FFMPEG_CORE_URL =
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js";
const FFMPEG_WASM_URL =
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FFmpegInstance = any;

export function useFFprobe() {
  const [status, setStatus] = useState<ProbeStatus>("idle");
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const ffmpegRef = useRef<FFmpegInstance>(null);

  const loadFFmpeg = async (): Promise<FFmpegInstance> => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;

    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    await ffmpeg.load({
      coreURL: await toBlobURL(FFMPEG_CORE_URL, "text/javascript"),
      wasmURL: await toBlobURL(FFMPEG_WASM_URL, "application/wasm"),
    });

    return ffmpeg;
  };

  const probeBuffer = async (buffer: ArrayBuffer) => {
    setResult(null);
    setError(null);

    try {
      setStatus("loading");
      setProgress("Loading FFmpeg WASM…");

      const ffmpeg = await loadFFmpeg();

      setStatus("analyzing");
      setProgress("Analyzing file…");

      const logs: string[] = [];
      const logHandler = ({ message }: { message: string }) =>
        logs.push(message);

      ffmpeg.on("log", logHandler);
      await ffmpeg.writeFile("input", new Uint8Array(buffer));

      // Run ffmpeg -i which outputs format/stream info to stderr then exits 1
      try {
        await ffmpeg.exec(["-hide_banner", "-i", "input"]);
      } catch {
        // Expected — no output specified, but logs captured
      }

      ffmpeg.off("log", logHandler);

      try {
        await ffmpeg.deleteFile("input");
      } catch {
        // ignore cleanup errors
      }

      const logText = logs.join("\n");
      const parsed = parseFFmpegLog(logText);

      if (!parsed) {
        throw new Error(
          "Could not parse file. Make sure it is a valid video or audio file."
        );
      }

      setResult(parsed);
      setStatus("done");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setStatus("error");
    }
  };

  const probeFile = async (file: File) => {
    const slice = file.slice(0, MAX_BYTES);
    const buffer = await slice.arrayBuffer();
    await probeBuffer(buffer);
  };

  const probeUrl = async (url: string) => {
    setResult(null);
    setError(null);

    try {
      setStatus("loading");
      setProgress("Fetching file…");

      const response = await fetch(
        `/api/probe-url?url=${encodeURIComponent(url)}`
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      await probeBuffer(buffer);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch the URL.";
      setError(msg);
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress("");
  };

  return { status, result, error, progress, probeFile, probeUrl, reset };
}
