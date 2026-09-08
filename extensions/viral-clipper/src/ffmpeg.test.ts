import { describe, it, expect } from "vitest";
import { escapeFfmpegFilterPath } from "./ffmpeg.js";

describe("ffmpeg filter path escaping", () => {
  it("escapes colons and single quotes and normalizes backslashes", () => {
    const rawPath = "sub/path:to/my'file.ass";
    const escaped = escapeFfmpegFilterPath(rawPath);
    expect(escaped).toBe("sub/path\\:to/my\\'file.ass");
  });
});
