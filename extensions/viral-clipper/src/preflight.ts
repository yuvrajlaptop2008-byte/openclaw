import { execFile } from "child_process";
import { promisify } from "util";
import type { PreflightCapabilities } from "./types.js";

const execFileAsync = promisify(execFile);

export async function checkCapabilities(): Promise<PreflightCapabilities> {
  const missingCapabilities: string[] = [];
  let hasFfmpeg = false;
  let ffmpegVersion: string | undefined;
  let hasWhisper = false;
  let hasTts = true; // Node synthesis fallback or configured openclaw TTS is assumed available

  // Check FFmpeg
  try {
    const { stdout, stderr } = await execFileAsync("ffmpeg", ["-version"]);
    const output = stdout || stderr;
    if (output && output.toLowerCase().includes("ffmpeg version")) {
      hasFfmpeg = true;
      const firstLine = output.split("\n")[0];
      ffmpegVersion = firstLine ? firstLine.trim() : "installed";
    } else {
      missingCapabilities.push("ffmpeg");
    }
  } catch {
    missingCapabilities.push("ffmpeg");
  }

  // Check Whisper
  try {
    await execFileAsync("whisper", ["--help"]);
    hasWhisper = true;
  } catch {
    missingCapabilities.push("whisper");
  }

  return {
    hasFfmpeg,
    hasWhisper,
    hasTts,
    ffmpegVersion,
    missingCapabilities,
  };
}
