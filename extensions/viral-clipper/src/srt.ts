import type { SrtEntry } from "./types.js";
import { parseTimestampToSeconds, formatSecondsToSrtTimestamp } from "./timestamps.js";

export function parseSrt(srtContent: string): SrtEntry[] {
  if (!srtContent || !srtContent.trim()) {
    return [];
  }

  const normalized = srtContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.trim().split(/\n\n+/);
  const entries: SrtEntry[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    let index = 1;
    let timeLineIdx = 0;

    if (/^\d+$/.test(lines[0])) {
      index = parseInt(lines[0], 10);
      timeLineIdx = 1;
    }

    if (lines.length <= timeLineIdx) continue;

    const timeLine = lines[timeLineIdx];
    const timeMatch = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[.,]\d{3}|\d+:\d{2}[.,]\d{3}|\d+[.,]\d+)\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3}|\d+:\d{2}[.,]\d{3}|\d+[.,]\d+)/);

    if (!timeMatch) continue;

    const startSec = parseTimestampToSeconds(timeMatch[1]);
    const endSec = parseTimestampToSeconds(timeMatch[2]);
    const textLines = lines.slice(timeLineIdx + 1);
    const text = textLines.join("\n");

    entries.push({
      index,
      startTime: startSec,
      endTime: endSec,
      text,
    });
  }

  return entries;
}

export function stringifySrt(entries: SrtEntry[]): string {
  return entries
    .map((entry, idx) => {
      const sNum = idx + 1;
      const startStr = formatSecondsToSrtTimestamp(entry.startTime);
      const endStr = formatSecondsToSrtTimestamp(entry.endTime);
      return `${sNum}\n${startStr} --> ${endStr}\n${entry.text}`;
    })
    .join("\n\n") + (entries.length > 0 ? "\n" : "");
}

export function cropSrtEntries(
  entries: SrtEntry[],
  cropStart: number,
  cropEnd: number
): SrtEntry[] {
  const result: SrtEntry[] = [];
  let indexCounter = 1;

  for (const entry of entries) {
    if (entry.endTime <= cropStart || entry.startTime >= cropEnd) {
      continue;
    }

    const clampedStart = Math.max(cropStart, entry.startTime);
    const clampedEnd = Math.min(cropEnd, entry.endTime);

    const shiftedStart = clampedStart - cropStart;
    const shiftedEnd = clampedEnd - cropStart;

    if (shiftedEnd > shiftedStart) {
      result.push({
        index: indexCounter++,
        startTime: shiftedStart,
        endTime: shiftedEnd,
        text: entry.text,
      });
    }
  }

  return result;
}

export function generateSrtFromScript(
  scriptText: string,
  totalDurationSeconds: number
): SrtEntry[] {
  const text = scriptText.trim();
  if (!text) return [];

  const chunks = text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((c) => c.trim())
    .filter(Boolean);

  if (chunks.length === 0) return [];

  const totalChars = chunks.reduce((acc, c) => acc + c.length, 0);
  const duration = Math.max(1, totalDurationSeconds);
  const charRate = duration / Math.max(1, totalChars);

  const entries: SrtEntry[] = [];
  let currentStart = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkDuration = Math.max(1.2, chunk.length * charRate);
    let currentEnd = currentStart + chunkDuration;

    if (i === chunks.length - 1) {
      currentEnd = duration;
    } else if (currentEnd > duration) {
      currentEnd = duration;
    }

    entries.push({
      index: i + 1,
      startTime: Number(currentStart.toFixed(3)),
      endTime: Number(currentEnd.toFixed(3)),
      text: chunk,
    });

    currentStart = currentEnd;
    if (currentStart >= duration) break;
  }

  return entries;
}
