import { describe, it, expect } from "vitest";
import { parseSrt, stringifySrt, cropSrtEntries, generateSrtFromScript } from "./srt.js";

describe("srt utilities", () => {
  const sampleSrt = `1
00:00:01,000 --> 00:00:05,000
Welcome to this awesome tutorial!

2
00:00:06,000 --> 00:00:10,000
Today we build an autopilot viral clipper.
`;

  it("parses SRT string content into entries", () => {
    const entries = parseSrt(sampleSrt);
    expect(entries).toHaveLength(2);
    expect(entries[0].startTime).toBe(1);
    expect(entries[0].endTime).toBe(5);
    expect(entries[0].text).toBe("Welcome to this awesome tutorial!");
    expect(entries[1].startTime).toBe(6);
    expect(entries[1].endTime).toBe(10);
  });

  it("stringifies SRT entries back to valid SRT format", () => {
    const entries = parseSrt(sampleSrt);
    const output = stringifySrt(entries);
    expect(output).toContain("00:00:01,000 --> 00:00:05,000");
    expect(output).toContain("Welcome to this awesome tutorial!");
  });

  it("crops SRT entries to a target time window and shifts timestamps", () => {
    const entries = parseSrt(sampleSrt);
    // Crop window: 5s to 12s
    const cropped = cropSrtEntries(entries, 5, 12);
    expect(cropped).toHaveLength(1);
    // Entry 2 (6s-10s) shifted by -5s becomes 1s to 5s
    expect(cropped[0].startTime).toBe(1);
    expect(cropped[0].endTime).toBe(5);
    expect(cropped[0].text).toBe("Today we build an autopilot viral clipper.");
  });

  it("generates SRT entries from plain script text", () => {
    const script = "First sentence here. Second sentence follows!";
    const entries = generateSrtFromScript(script, 10);
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0].startTime).toBe(0);
    expect(entries[entries.length - 1].endTime).toBe(10);
  });
});
