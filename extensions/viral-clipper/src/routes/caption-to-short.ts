import fs from "fs/promises";
import path from "path";
import type {
  CaptionToShortInput,
  PreflightCapabilities,
  RenderedClipResult,
  ViralClipperOutput,
} from "../types.js";
import { generateSrtFromScript, stringifySrt } from "../srt.js";
import { generateAssSubtitles } from "../ass.js";
import { renderClipWithFfmpeg } from "../ffmpeg.js";
import { generateSocialPostPackages } from "../social-package.js";

export async function processCaptionToShort(
  input: CaptionToShortInput,
  workDir: string,
  capabilities: PreflightCapabilities
): Promise<ViralClipperOutput> {
  const warnings: string[] = [];
  const title = input.title || "Viral Short";
  const filenameBase = input.filename || "caption_short_master";
  const language = input.language || "en";

  const scriptText = input.scriptText.trim();
  if (!scriptText) {
    throw new Error("Caption-to-short route requires non-empty scriptText.");
  }

  const estimatedDurationSeconds = Math.max(5, Math.ceil(scriptText.length / 15));

  const srtEntries = generateSrtFromScript(scriptText, estimatedDurationSeconds);
  const srtContent = stringifySrt(srtEntries);

  const srtPath = path.join(workDir, `${filenameBase}.srt`);
  await fs.writeFile(srtPath, srtContent, "utf-8");

  const assContent = generateAssSubtitles(srtEntries, {
    fontName: input.fontName || "Arial",
    fontSize: 52,
    marginV: 140,
  });
  const assPath = path.join(workDir, `${filenameBase}.ass`);
  await fs.writeFile(assPath, assContent, "utf-8");

  const videoOutputPath = path.join(workDir, `${filenameBase}.mp4`);

  if (capabilities.hasFfmpeg) {
    await renderClipWithFfmpeg({
      inputAudioPath: input.audioPath,
      inputVideoPath: input.backgroundVideoPath,
      assSubtitlePath: assPath,
      outputPath: videoOutputPath,
      durationSeconds: estimatedDurationSeconds,
      reframeToVertical: true,
    });
  } else {
    warnings.push(
      "FFmpeg binary not found in PATH. Created SRT, ASS, and social post package assets; skipped real MP4 video compilation."
    );
    await fs.writeFile(
      videoOutputPath,
      `[Placeholder for ${filenameBase}.mp4 - FFmpeg required for video render]`,
      "utf-8"
    );
  }

  const socialPackages = generateSocialPostPackages(title, scriptText, language);

  const renderedClip: RenderedClipResult = {
    clipId: filenameBase,
    title,
    videoPath: videoOutputPath,
    srtPath,
    durationSeconds: estimatedDurationSeconds,
    socialPackages,
  };

  return {
    success: true,
    route: "caption-to-short",
    renderedClips: [renderedClip],
    summary: `Processed caption-to-short for "${title}" (${estimatedDurationSeconds}s).`,
    capabilities,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
