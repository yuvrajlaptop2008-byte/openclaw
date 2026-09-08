import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export interface RenderOptions {
  inputVideoPath?: string;
  inputAudioPath?: string;
  assSubtitlePath?: string;
  outputPath: string;
  startTime?: number;
  endTime?: number;
  durationSeconds?: number;
  reframeToVertical?: boolean;
  targetWidth?: number;
  targetHeight?: number;
}

export function escapeFfmpegFilterPath(filePath: string): string {
  // Normalize windows backslashes to slashes or escape
  const normalized = filePath.replace(/\\/g, "/");
  // Escape : and '
  return normalized.replace(/:/g, "\\:").replace(/'/g, "\\'");
}

export async function renderClipWithFfmpeg(options: RenderOptions): Promise<void> {
  const {
    inputVideoPath,
    inputAudioPath,
    assSubtitlePath,
    outputPath,
    startTime,
    endTime,
    durationSeconds,
    reframeToVertical = true,
    targetWidth = 1080,
    targetHeight = 1920,
  } = options;

  const args: string[] = [];

  // Input video or synthetic color background
  if (inputVideoPath) {
    if (startTime !== undefined && startTime > 0) {
      args.push("-ss", startTime.toFixed(3));
    }
    if (endTime !== undefined && startTime !== undefined && endTime > startTime) {
      args.push("-to", endTime.toFixed(3));
    } else if (durationSeconds !== undefined && durationSeconds > 0) {
      args.push("-t", durationSeconds.toFixed(3));
    }
    args.push("-i", inputVideoPath);
  } else {
    // Synthetic vertical color background canvas
    const dur = durationSeconds || (endTime && startTime ? endTime - startTime : 10);
    args.push(
      "-f",
      "lavfi",
      "-i",
      `color=c=black:s=${targetWidth}x${targetHeight}:d=${dur.toFixed(3)}:r=30`
    );
  }

  // Optional separate audio track
  if (inputAudioPath) {
    args.push("-i", inputAudioPath);
  }

  const vfFilters: string[] = [];

  if (reframeToVertical) {
    if (inputVideoPath) {
      // Reframe horizontal or arbitrary video to 9:16 vertical by center crop or scale/pad
      vfFilters.push(
        `crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=${targetWidth}:${targetHeight}`
      );
    }
  } else if (!inputVideoPath) {
    vfFilters.push(`scale=${targetWidth}:${targetHeight}`);
  }

  if (assSubtitlePath) {
    const escapedSubPath = escapeFfmpegFilterPath(path.resolve(assSubtitlePath));
    vfFilters.push(`subtitles='${escapedSubPath}'`);
  }

  if (vfFilters.length > 0) {
    args.push("-vf", vfFilters.join(","));
  }

  // Audio mapping and codec selection
  if (inputAudioPath) {
    args.push("-map", "0:v:0", "-map", "1:a:0", "-c:a", "aac", "-b:a", "128k");
  } else if (inputVideoPath) {
    args.push("-c:a", "aac", "-b:a", "128k");
  } else {
    // Generate silent audio if canvas background only and no audio track
    args.push("-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-c:a", "aac", "-shortest");
  }

  args.push(
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-y", // Overwrite output file
    outputPath
  );

  await execFileAsync("ffmpeg", args);
}
