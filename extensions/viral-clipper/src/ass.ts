import { SrtEntry } from "./types.js";
import { formatSecondsToAssTimestamp } from "./timestamps.js";

export interface AssStyleOptions {
  fontName?: string;
  fontSize?: number;
  primaryColor?: string; // ASS color code e.g. &H00FFFFFF (White)
  outlineColor?: string; // ASS color code e.g. &H00000000 (Black)
  backColor?: string;
  bold?: boolean;
  alignment?: number;    // 2 = bottom center, 5 = top center, 8 = middle center
  marginV?: number;
}

export function escapeAssText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n|\r\n/g, "\\N");
}

export function generateAssSubtitles(
  entries: SrtEntry[],
  options: AssStyleOptions = {}
): string {
  const fontName = options.fontName || "Arial";
  const fontSize = options.fontSize || 48;
  const primaryColor = options.primaryColor || "&H00FFFFFF";
  const outlineColor = options.outlineColor || "&H00000000";
  const backColor = options.backColor || "&H00000000";
  const bold = options.bold !== false ? 1 : 0;
  const alignment = options.alignment || 2; // Bottom center
  const marginV = options.marginV || 120;

  const header = `[Script Info]
Title: Viral Clipper Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},${bold},0,0,0,100,100,0,0,1,3,1,${alignment},20,20,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const dialogueLines = entries.map((entry) => {
    const startStr = formatSecondsToAssTimestamp(entry.startTime);
    const endStr = formatSecondsToAssTimestamp(entry.endTime);
    const escapedText = escapeAssText(entry.text);
    return `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${escapedText}`;
  });

  return header + dialogueLines.join("\n") + (dialogueLines.length > 0 ? "\n" : "");
}
