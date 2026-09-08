import { describe, it, expect } from "vitest";
import { escapeAssText, generateAssSubtitles } from "./ass.js";
import { SrtEntry } from "./types.js";

describe("ass subtitle utilities", () => {
  it("escapes special characters for ASS formatting", () => {
    expect(escapeAssText("Hello {world}\\test, line\nbreak")).toBe(
      "Hello \\{world\\}\\\\test, line\\Nbreak"
    );
  });

  it("generates valid ASS file content from subtitle entries", () => {
    const entries: SrtEntry[] = [
      { index: 1, startTime: 1, endTime: 4, text: "Caption line 1" },
    ];
    const ass = generateAssSubtitles(entries, { fontName: "Arial", fontSize: 48 });
    expect(ass).toContain("[Script Info]");
    expect(ass).toContain("[V4+ Styles]");
    expect(ass).toContain("[Events]");
    expect(ass).toContain("Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,Caption line 1");
  });
});
