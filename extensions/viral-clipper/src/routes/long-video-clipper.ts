import fs from "fs/promises";
import path from "path";
import type {
  HighlightClipSpec,
  LongVideoClipInput,
  PreflightCapabilities,
  RenderedClipResult,
  SrtEntry,
  ViralClipperOutput,
} from "../types.js";
import { cropSrtEntries, parseSrt, stringifySrt } from "../srt.js";
import { generateAssSubtitles } from "../ass.js";
import { renderClipWithFfmpeg } from "../ffmpeg.js";
import { generateSocialPostPackages } from "../social-package.js";
import { formatSecondsToFilenameTime } from "../timestamps.js";

export async function processLongVideoClipping(
  input: LongVideoClipInput,
  workDir: string,
  capabilities: PreflightCapabilities
): Promise<ViralClipperOutput> {
  const warnings: string[] = [];

  if (!input.videoPath) {
    throw new Error("Long-video clipping route requires videoPath.");
  }

  let fullSrtEntries: SrtEntry[] = [];
  if (input.srtContent) {
    fullSrtEntries = parseSrt(input.srtContent);
  } else if (input.srtPath) {
    try {
      const content = await fs.readFile(input.srtPath, "utf-8");
      fullSrtEntries = parseSrt(content);
    } catch {
      warnings.push(`Could not read SRT file at ${input.srtPath}. Proceeding without timed subtitles.`);
    }
  }

  let clips: HighlightClipSpec[] = input.clips || [];
  if (clips.length === 0) {
    clips = [
      {
        id: "clip_1",
        title: "Highlight Clip 1",
        startTime: 0,
        endTime: 30,
      },
    ];
  }

  const renderedClips: RenderedClipResult[] = [];

  for (let idx = 0; idx < clips.length; idx++) {
    const clip = clips[idx];
    const clipId = clip.id || `clip_${idx + 1}`;
    const clipTitle = clip.title || `Highlight Clip ${idx + 1}`;

    const startSec = Math.max(0, clip.startTime);
    const endSec = Math.max(startSec + 1, clip.endTime);
    const duration = endSec - startSec;

    const timeTag = `${formatSecondsToFilenameTime(startSec)}_to_${formatSecondsToFilenameTime(endSec)}`;
    const baseName = `${clipId}_${timeTag}`;

    let clipSrtPath: string | undefined;
    let clipAssPath: string | undefined;

    if (fullSrtEntries.length > 0) {
      const croppedEntries = cropSrtEntries(fullSrtEntries, startSec, endSec);
      if (croppedEntries.length > 0) {
        clipSrtPath = path.join(workDir, `${baseName}.srt`);
        await fs.writeFile(clipSrtPath, stringifySrt(croppedEntries), "utf-8");

        clipAssPath = path.join(workDir, `${baseName}.ass`);
        const assContent = generateAssSubtitles(croppedEntries, {
          fontName: input.fontName || "Arial",
          fontSize: 52,
          marginV: 120,
        });
        await fs.writeFile(clipAssPath, assContent, "utf-8");
      }
    }

    const clipVideoPath = path.join(workDir, `${baseName}.mp4`);

    if (capabilities.hasFfmpeg) {
      await renderClipWithFfmpeg({
        inputVideoPath: input.videoPath,
        assSubtitlePath: clipAssPath,
        outputPath: clipVideoPath,
        startTime: startSec,
        endTime: endSec,
        reframeToVertical: input.reframeToVertical !== false,
      });
    } else {
      if (!warnings.includes("FFmpeg binary not found in PATH.")) {
        warnings.push("FFmpeg binary not found in PATH. Created SRT, ASS, and social packages; skipped video rendering.");
      }
      await fs.writeFile(
        clipVideoPath,
        `[Placeholder for ${baseName}.mp4 - FFmpeg required for video rendering]`,
        "utf-8"
      );
    }

    const summaryText = clip.description || `Highlight from ${startSec}s to ${endSec}s`;
    const socialPackages = generateSocialPostPackages(clipTitle, summaryText, input.language || "en");

    renderedClips.push({
      clipId,
      title: clipTitle,
      videoPath: clipVideoPath,
      srtPath: clipSrtPath,
      durationSeconds: duration,
      socialPackages,
    });
  }

  return {
    success: true,
    route: "long-video-clip",
    renderedClips,
    summary: `Extracted ${renderedClips.length} clip(s) from video.`,
    capabilities,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
