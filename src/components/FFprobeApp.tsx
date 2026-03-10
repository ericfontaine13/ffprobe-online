"use client";

import { useState } from "react";
import { useFFprobe } from "@/lib/useFFprobe";
import { Navbar } from "./Navbar";
import { ModeToggle } from "./ModeToggle";
import { UrlInput } from "./UrlInput";
import { FileDropzone } from "./FileDropzone";
import { MetadataGrid } from "./MetadataGrid";
import { JsonViewer } from "./JsonViewer";

type InputMode = "url" | "file";
type ViewMode = "summary" | "json";

export function FFprobeApp() {
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const { status, result, error, progress, probeFile, probeUrl, reset } =
    useFFprobe();

  const isLoading = status === "loading" || status === "analyzing";

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    reset();
  };

  return (
    <div className="min-h-screen" style={{ background: "#000000", color: "#ffffff" }}>
      <Navbar />

      <main className="max-w-[960px] mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Inspect video and audio metadata{" "}
            <span style={{ color: "#00D692" }}>instantly.</span>
          </h1>
          <h2 className="text-base font-normal" style={{ color: "#999999" }}>
            Enjoy a{" "}
            <span style={{ color: "#00D692" }}>COOL</span>{" "}
            tool to analyze metadata quickly and easily.
            <br />You can upload a file or provide a video URL.
            <br />Handy when you need to inspect a video, validate incoming files, or troubleshoot an encoding pipeline.
          </h2>
        </div>

        {/* Input card */}
        <div
          className="rounded-lg p-6 mb-8"
          style={{ border: "1px solid #333333", background: "rgba(255,255,255,0.02)" }}
        >
          <div className="mb-5">
            <ModeToggle mode={inputMode} onChange={handleModeChange} />
          </div>

          {inputMode === "url" ? (
            <UrlInput onSubmit={probeUrl} loading={isLoading} />
          ) : (
            <FileDropzone onFile={probeFile} loading={isLoading} />
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="mt-5 flex items-center gap-3">
              <span
                className="inline-block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#00D692", borderTopColor: "transparent" }}
              />
              <span className="text-sm" style={{ color: "#00D692" }}>
                {progress}
              </span>
            </div>
          )}

          {/* Error state */}
          {status === "error" && error && (
            <div
              className="mt-5 rounded px-4 py-3 text-sm"
              style={{ border: "1px solid #cc3333", background: "rgba(204,51,51,0.08)", color: "#ff6666" }}
            >
              <span className="font-bold">Error: </span>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {status === "done" && result && (
          <div>
            {/* View toggle */}
            <div
              className="flex items-center justify-between mb-6 pb-4"
              style={{ borderBottom: "1px solid #333333" }}
            >
              <h2 className="text-sm tracking-widest uppercase" style={{ color: "#999999" }}>
                Results
              </h2>
              <div
                className="inline-flex rounded"
                style={{ border: "1px solid #333333", overflow: "hidden" }}
              >
                {(["summary", "json"] as ViewMode[]).map((v) => {
                  const active = viewMode === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setViewMode(v)}
                      className="px-4 py-1.5 text-xs tracking-widest uppercase transition-colors cursor-pointer"
                      style={{
                        background: active ? "rgba(0,214,146,0.1)" : "transparent",
                        color: active ? "#00D692" : "#999999",
                        borderRight: v === "summary" ? "1px solid #333333" : "none",
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {viewMode === "summary" ? (
              <MetadataGrid result={result} />
            ) : (
              <JsonViewer result={result} />
            )}

            {/* Analyze another */}
            <button
              onClick={reset}
              className="mt-10 text-xs tracking-widest uppercase transition-colors cursor-pointer"
              style={{ color: "#999999" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#999999")}
            >
              ← Analyze another file
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="mt-20 py-8 text-center text-xs"
        style={{ borderTop: "1px solid #333333", color: "#999999" }}
      >
        metadata.COOL · Made with ❤️ by the team behind{" "}
      <a
        href="https://chunkify.dev"
        target="_blank"
        rel="noopener"
        className="transition-colors"
        style={{ color: "#00D692" }}
      >
        Chunkify
      </a>{" "}· 2026
      </footer>
    </div>
  );
}
