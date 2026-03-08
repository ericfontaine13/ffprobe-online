"use client";

import { useState } from "react";
import { ProbeResult, toJson } from "@/lib/parse-probe";

interface JsonViewerProps {
  result: ProbeResult;
}

export function JsonViewer({ result }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(toJson(result), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 text-xs px-3 py-1 rounded transition-colors cursor-pointer"
        style={{
          border: "1px solid #333333",
          background: "transparent",
          color: copied ? "#00D692" : "#999999",
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre
        className="text-xs leading-relaxed overflow-x-auto rounded p-6"
        style={{
          background: "#0d0d0d",
          border: "1px solid #333333",
          color: "#a6b4c1",
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          maxHeight: "600px",
          overflowY: "auto",
        }}
      >
        <code>{json}</code>
      </pre>
    </div>
  );
}
