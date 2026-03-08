"use client";

type Mode = "url" | "file";

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div
      className="inline-flex rounded"
      style={{ border: "1px solid #333333", overflow: "hidden" }}
    >
      {(["url", "file"] as Mode[]).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className="px-6 py-2 text-xs tracking-widest uppercase transition-colors cursor-pointer"
            style={{
              background: active ? "rgba(0,214,146,0.1)" : "transparent",
              color: active ? "#00D692" : "#999999",
              borderRight: m === "url" ? "1px solid #333333" : "none",
            }}
          >
            {m === "url" ? "▶ URL" : "⬡ File"}
          </button>
        );
      })}
    </div>
  );
}
