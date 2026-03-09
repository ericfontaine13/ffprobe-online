"use client";

import { useState } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  { label: "Big Buck Bunny (H.264 MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { label: "Elephants Dream (H.264 MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { label: "Tears of Steel (H.264 MP4)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
];

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      {/* Input + button row */}
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/video.mp4"
          disabled={loading}
          className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder-dim rounded outline-none transition-colors"
          style={{ border: "1px solid #333333", fontFamily: "inherit" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#00D692")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#333333")}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-6 py-3 text-xs tracking-widest uppercase transition-colors cursor-pointer rounded disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ border: "1px solid #00D692", background: "rgba(0,214,146,0.1)", color: "#00D692" }}
        >
          {loading ? "…" : "Analyze"}
        </button>
      </div>

      {/* Example URLs */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#555" }}>Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.url}
            type="button"
            onClick={() => { setUrl(ex.url); onSubmit(ex.url); }}
            className="text-[10px] transition-colors"
            style={{ color: "#00D692" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#00D692")}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </form>
  );
}
