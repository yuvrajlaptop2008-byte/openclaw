import { describe, it, expect } from "vitest";
import {
  parseTimestampToSeconds,
  formatSecondsToSrtTimestamp,
  formatSecondsToAssTimestamp,
  formatSecondsToFilenameTime,
} from "./timestamps.js";

describe("timestamps", () => {
  it("parses numeric and string timestamps correctly", () => {
    expect(parseTimestampToSeconds(90)).toBe(90);
    expect(parseTimestampToSeconds("120.5")).toBe(120.5);
    expect(parseTimestampToSeconds("01:30,500")).toBe(90.5);
    expect(parseTimestampToSeconds("01:02:03.400")).toBe(3723.4);
  });

  it("throws on invalid timestamp strings", () => {
    expect(() => parseTimestampToSeconds("invalid")).toThrow();
    expect(() => parseTimestampToSeconds("-10")).toThrow();
  });

  it("formats seconds to SRT timestamp format (HH:MM:SS,mmm)", () => {
    expect(formatSecondsToSrtTimestamp(3723.456)).toBe("01:02:03,456");
    expect(formatSecondsToSrtTimestamp(0)).toBe("00:00:00,000");
  });

  it("formats seconds to ASS timestamp format (H:MM:SS.cs)", () => {
    expect(formatSecondsToAssTimestamp(3723.45)).toBe("1:02:03.45");
    expect(formatSecondsToAssTimestamp(0)).toBe("0:00:00.00");
  });

  it("formats seconds to filename time string", () => {
    expect(formatSecondsToFilenameTime(83)).toBe("1m23s");
    expect(formatSecondsToFilenameTime(0)).toBe("0m00s");
  });
});
