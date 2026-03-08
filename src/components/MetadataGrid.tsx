import { ProbeResult, formatDuration } from "@/lib/parse-probe";

interface MetadataGridProps {
  result: ProbeResult;
}

interface CardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function Card({ label, value, accent }: CardProps) {
  return (
    <div
      className="rounded p-4 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent ? "#00D692" : "#333333"}`,
      }}
    >
      <span className="text-xs text-dim uppercase tracking-wider">{label}</span>
      <span
        className="text-sm font-bold truncate"
        style={{ color: accent ? "#00D692" : "#ffffff" }}
        title={value}
      >
        {value || "N/A"}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs uppercase tracking-widest mt-6 mb-3"
      style={{ color: "#999999" }}
    >
      <span style={{ color: "#00D692" }}>■</span> {children}
    </h3>
  );
}

export function MetadataGrid({ result }: MetadataGridProps) {
  const { format, duration, durationSeconds, bitrate, videoStreams, audioStreams, metadata } = result;

  return (
    <div>
      {/* Container section */}
      <SectionTitle>Container</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card label="Format" value={format} accent />
        <Card label="Duration" value={formatDuration(durationSeconds)} />
        <Card label="Bitrate" value={bitrate} />
        <Card label="Filename" value={result.filename.split("/").pop() ?? result.filename} />
      </div>

      {/* Video streams */}
      {videoStreams.map((v, i) => (
        <div key={v.index}>
          <SectionTitle>
            Video Stream {videoStreams.length > 1 ? `#${i}` : ""}
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card
              label="Codec"
              value={v.profile ? `${v.codec} (${v.profile})` : v.codec}
              accent
            />
            <Card label="Resolution" value={v.resolution} />
            <Card label="Frame Rate" value={v.fps ? `${v.fps} fps` : "N/A"} />
            <Card label="Bitrate" value={v.bitrate || "N/A"} />
            {v.dar && <Card label="Aspect Ratio" value={v.dar} />}
            {v.pixelFormat && (
              <Card label="Pixel Format" value={v.pixelFormat} />
            )}
          </div>
        </div>
      ))}

      {/* Audio streams */}
      {audioStreams.map((a, i) => (
        <div key={a.index}>
          <SectionTitle>
            Audio Stream {audioStreams.length > 1 ? `#${i}` : ""}
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card
              label="Codec"
              value={a.profile ? `${a.codec} (${a.profile})` : a.codec}
              accent
            />
            <Card label="Sample Rate" value={a.sampleRate} />
            <Card label="Channels" value={a.channels} />
            <Card label="Bitrate" value={a.bitrate || "N/A"} />
          </div>
        </div>
      ))}

      {/* Metadata tags */}
      {Object.keys(metadata).length > 0 && (
        <>
          <SectionTitle>Metadata Tags</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(metadata).map(([k, v]) => (
              <Card key={k} label={k} value={v} />
            ))}
          </div>
        </>
      )}

      {/* Duration raw */}
      {duration !== "N/A" && (
        <p className="text-xs text-dim mt-4">
          Raw duration: <span className="text-subtle">{duration}</span>
        </p>
      )}
    </div>
  );
}
