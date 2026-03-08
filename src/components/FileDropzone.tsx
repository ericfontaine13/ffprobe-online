"use client";

import { useRef, useState } from "react";

interface FileDropzoneProps {
  onFile: (file: File) => void;
  loading: boolean;
}

export function FileDropzone({ onFile, loading }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="w-full rounded flex flex-col items-center justify-center gap-3 py-14 transition-colors cursor-pointer select-none"
      style={{
        border: `1px dashed ${dragging ? "#00D692" : "#333333"}`,
        background: dragging ? "rgba(0,214,146,0.05)" : "transparent",
      }}
    >
      <span className="text-3xl text-dim" aria-hidden>
        ⬡
      </span>
      <div className="text-center">
        <p className="text-sm text-white">
          {loading ? "Processing…" : "Drop a video or audio file here"}
        </p>
        <p className="text-xs text-dim mt-1">
          or click to browse · first 10 MB read locally
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="video/*,audio/*"
        onChange={handleChange}
        disabled={loading}
      />
    </div>
  );
}
