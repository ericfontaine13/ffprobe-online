"use client";

import { useState } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/video.mp4"
        disabled={loading}
        className="flex-1 px-4 py-3 text-sm bg-transparent text-white placeholder-dim rounded outline-none transition-colors"
        style={{
          border: "1px solid #333333",
          fontFamily: "inherit",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "#00D692")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "#333333")
        }
      />
      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="px-6 py-3 text-xs tracking-widest uppercase transition-colors cursor-pointer rounded disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          border: "1px solid #00D692",
          background: "rgba(0,214,146,0.1)",
          color: "#00D692",
        }}
      >
        {loading ? "…" : "Analyze"}
      </button>
    </form>
  );
}
