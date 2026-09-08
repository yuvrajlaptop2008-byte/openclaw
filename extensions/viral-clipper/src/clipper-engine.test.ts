import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { executeViralClipper } from "./clipper-engine.js";

describe("clipper-engine integration", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "viral-clipper-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("executes caption-to-short route and generates assets", async () => {
    const result = await executeViralClipper({
      route: "caption-to-short",
      scriptText: "This is a test viral video script for Instagram Reels.",
      title: "Test Viral Short",
      outputDir: tmpDir,
    });

    expect(result.success).toBe(true);
    expect(result.route).toBe("caption-to-short");
    expect(result.renderedClips).toHaveLength(1);

    const clip = result.renderedClips[0];
    expect(clip.title).toBe("Test Viral Short");
    expect(clip.socialPackages).toHaveLength(3);

    // Verify generated subtitle files exist in tmpDir
    const srtExists = await fs.stat(clip.srtPath!).then(() => true).catch(() => false);
    expect(srtExists).toBe(true);

    const videoExists = await fs.stat(clip.videoPath).then(() => true).catch(() => false);
    expect(videoExists).toBe(true);
  });

  it("executes long-video-clip route with SRT captions", async () => {
    const fakeVideoPath = path.join(tmpDir, "source_video.mp4");
    await fs.writeFile(fakeVideoPath, "fake mp4 content");

    const sampleSrt = `1\n00:00:01,000 --> 00:00:08,000\nKey highlight clip speech.`;

    const result = await executeViralClipper({
      route: "long-video-clip",
      videoPath: fakeVideoPath,
      srtContent: sampleSrt,
      clips: [
        {
          id: "highlight_1",
          title: "Top Moment",
          startTime: 0,
          endTime: 10,
        },
      ],
      outputDir: tmpDir,
    });

    expect(result.success).toBe(true);
    expect(result.route).toBe("long-video-clip");
    expect(result.renderedClips).toHaveLength(1);

    const clip = result.renderedClips[0];
    expect(clip.clipId).toBe("highlight_1");
    expect(clip.title).toBe("Top Moment");
    expect(clip.socialPackages.some((p) => p.platform === "tiktok")).toBe(true);
  });

  it("rejects path collisions when videoPath equals outputDir", async () => {
    await expect(
      executeViralClipper({
        route: "long-video-clip",
        videoPath: tmpDir,
        outputDir: tmpDir,
      })
    ).rejects.toThrow(/cannot be identical/);
  });
});
