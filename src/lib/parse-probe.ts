export interface VideoStream {
  index: string;
  codec: string;
  profile: string;
  pixelFormat: string;
  resolution: string;
  width: number;
  height: number;
  fps: number;
  bitrate: string;
  dar?: string;
}

export interface AudioStream {
  index: string;
  codec: string;
  profile: string;
  sampleRate: string;
  channels: string;
  sampleFormat: string;
  bitrate: string;
}

export interface ProbeResult {
  filename: string;
  format: string;
  duration: string;
  durationSeconds: number;
  bitrate: string;
  videoStreams: VideoStream[];
  audioStreams: AudioStream[];
  metadata: Record<string, string>;
  rawLog: string;
}

function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(":").map(parseFloat);
  if (parts.length !== 3) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function parseFFmpegLog(log: string): ProbeResult | null {
  if (!log.includes("Input #")) return null;

  // --- Format & Filename ---
  const inputMatch = log.match(
    /Input #\d+,\s*([^\n]+?),\s*from\s*'([^']+)':/
  );
  const rawFormat = inputMatch ? inputMatch[1] : "unknown";
  const filename = inputMatch ? inputMatch[2] : "input";

  // Normalise: take first format token, uppercase
  const format = rawFormat.split(",")[0].trim().toUpperCase();

  // --- Duration & Bitrate ---
  const durationMatch = log.match(
    /Duration:\s*(\d{2}:\d{2}:\d{2}\.?\d*),\s*start:[\s\d.]+,\s*bitrate:\s*([\d.]+ \w+\/s)/
  );
  const duration = durationMatch ? durationMatch[1] : "N/A";
  const bitrate = durationMatch ? durationMatch[2] : "N/A";
  const durationSeconds = durationMatch
    ? parseDurationToSeconds(durationMatch[1])
    : 0;

  // --- Global Metadata (first Metadata: block only) ---
  const metadata: Record<string, string> = {};
  const firstMetaBlock = log.match(
    /Metadata:\n((?:[ \t]+\S[^\n]*\n)+)/
  );
  if (firstMetaBlock) {
    for (const line of firstMetaBlock[1].split("\n")) {
      const m = line.match(/^\s{4}(\S[^:]*?)\s*:\s*(.+)$/);
      if (m) metadata[m[1].trim()] = m[2].trim();
    }
  }

  // --- Video Streams ---
  const videoStreams: VideoStream[] = [];
  const videoMatches = [
    ...log.matchAll(/Stream #(\d+:\d+)[^:]*:\s*Video:\s*(.+)/g),
  ];

  for (const match of videoMatches) {
    const index = match[1];
    const rest = match[2];

    const codecMatch = rest.match(/^(\w+)(?:\s+\(([^)]+)\))?/);
    const codec = codecMatch ? codecMatch[1].toUpperCase() : "UNKNOWN";
    const profile = codecMatch?.[2] ?? "";

    // Pixel format: first token after codec, before resolution
    const pixFmtMatch = rest.match(/,\s+([a-z0-9_]+(?:\([^)]*\))?),\s+\d+x\d+/);
    const pixelFormat = pixFmtMatch
      ? pixFmtMatch[1].split("(")[0].trim()
      : "";

    const resMatch = rest.match(/(\d{2,5})x(\d{2,5})/);
    const width = resMatch ? parseInt(resMatch[1]) : 0;
    const height = resMatch ? parseInt(resMatch[2]) : 0;

    const darMatch = rest.match(/DAR\s+(\d+:\d+)/);
    const dar = darMatch ? darMatch[1] : undefined;

    const fpsMatch = rest.match(/([\d.]+)\s+fps/);
    const fps = fpsMatch ? parseFloat(fpsMatch[1]) : 0;

    const bitrateMatch = rest.match(/([\d.]+)\s+kb\/s/);
    const streamBitrate = bitrateMatch ? `${bitrateMatch[1]} kb/s` : "";

    videoStreams.push({
      index,
      codec,
      profile,
      pixelFormat,
      resolution: width && height ? `${width}x${height}` : "N/A",
      width,
      height,
      fps,
      bitrate: streamBitrate,
      dar,
    });
  }

  // --- Audio Streams ---
  const audioStreams: AudioStream[] = [];
  const audioMatches = [
    ...log.matchAll(/Stream #(\d+:\d+)[^:]*:\s*Audio:\s*(.+)/g),
  ];

  for (const match of audioMatches) {
    const index = match[1];
    const rest = match[2];

    const codecMatch = rest.match(/^(\w+)(?:\s+\(([^)]+)\))?/);
    const codec = codecMatch ? codecMatch[1].toUpperCase() : "UNKNOWN";
    const profile = codecMatch?.[2] ?? "";

    const srMatch = rest.match(/(\d+)\s+Hz/);
    const sampleRate = srMatch ? `${srMatch[1]} Hz` : "N/A";

    // Channels: token after "Hz,"
    const chMatch = rest.match(/Hz,\s*([^,]+),/);
    const channels = chMatch ? chMatch[1].trim() : "N/A";

    // Sample format: token after channels
    const sfParts = rest.split(",");
    const sampleFormat = sfParts.length >= 4 ? sfParts[3].trim() : "";

    const bitrateMatch = rest.match(/([\d.]+)\s+kb\/s/);
    const streamBitrate = bitrateMatch ? `${bitrateMatch[1]} kb/s` : "";

    audioStreams.push({
      index,
      codec,
      profile,
      sampleRate,
      channels,
      sampleFormat,
      bitrate: streamBitrate,
    });
  }

  return {
    filename,
    format,
    duration,
    durationSeconds,
    bitrate,
    videoStreams,
    audioStreams,
    metadata,
    rawLog: log,
  };
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "N/A";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function toJson(result: ProbeResult): object {
  return {
    format: {
      filename: result.filename,
      format_name: result.format,
      duration: result.durationSeconds.toFixed(6),
      bit_rate: result.bitrate,
      tags: result.metadata,
    },
    streams: [
      ...result.videoStreams.map((v) => ({
        index: v.index,
        codec_type: "video",
        codec_name: v.codec,
        profile: v.profile,
        width: v.width,
        height: v.height,
        r_frame_rate: v.fps ? `${v.fps}/1` : undefined,
        bit_rate: v.bitrate,
        pix_fmt: v.pixelFormat,
        display_aspect_ratio: v.dar,
      })),
      ...result.audioStreams.map((a) => ({
        index: a.index,
        codec_type: "audio",
        codec_name: a.codec,
        profile: a.profile,
        sample_rate: a.sampleRate,
        channels: a.channels,
        sample_fmt: a.sampleFormat,
        bit_rate: a.bitrate,
      })),
    ],
  };
}
