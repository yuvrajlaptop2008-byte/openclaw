import fs from "fs/promises";
import path from "path";
import { ViralClipperInput, ViralClipperOutput } from "./types.js";
import { checkCapabilities } from "./preflight.js";
import { processCaptionToShort } from "./routes/caption-to-short.js";
import { processLongVideoClipping } from "./routes/long-video-clipper.js";

export async function executeViralClipper(
  input: ViralClipperInput,
  defaultOutputDir?: string
): Promise<ViralClipperOutput> {
  // 1. Perform preflight capability check
  const capabilities = await checkCapabilities();

  // 2. Resolve output workspace directory
  const targetOutputDir = input.outputDir || defaultOutputDir || path.join(process.cwd(), "viral_clipper_output");
  await fs.mkdir(targetOutputDir, { recursive: true });

  // 3. Path collision & safety checks
  if (input.route === "long-video-clip") {
    if (!input.videoPath) {
      throw new Error("Missing required 'videoPath' for long-video-clip route.");
    }
    const absInputVideo = path.resolve(input.videoPath);
    const absOutputDir = path.resolve(targetOutputDir);

    if (absInputVideo === absOutputDir) {
      throw new Error("Input video path and output directory cannot be identical.");
    }
  } else if (input.route === "caption-to-short") {
    if (input.backgroundVideoPath) {
      const absBg = path.resolve(input.backgroundVideoPath);
      const absOutputDir = path.resolve(targetOutputDir);
      if (absBg === absOutputDir) {
        throw new Error("Background video path and output directory cannot be identical.");
      }
    }
  } else {
    throw new Error(`Unsupported viral clipper route: ${(input as any).route}`);
  }

  // 4. Dispatch route
  if (input.route === "caption-to-short") {
    return await processCaptionToShort(input, targetOutputDir, capabilities);
  } else {
    return await processLongVideoClipping(input, targetOutputDir, capabilities);
  }
}
