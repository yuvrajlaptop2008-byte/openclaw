/**
 * Utilities for timestamp parsing, formatting, and time calculations.
 */

export function parseTimestampToSeconds(input: string | number): number {
  if (typeof input === "number") {
    if (isNaN(input) || input < 0) {
      throw new Error(`Invalid timestamp number: ${input}`);
    }
    return input;
  }

  const str = input.trim();
  if (!str) {
    throw new Error("Empty timestamp string");
  }

  if (str.startsWith("-")) {
    throw new Error(`Negative timestamp not allowed: ${str}`);
  }

  // Pure numeric string
  if (/^\d+(\.\d+)?$/.test(str)) {
    const val = parseFloat(str);
    if (isNaN(val) || val < 0) {
      throw new Error(`Invalid timestamp number string: ${str}`);
    }
    return val;
  }

  // Standard time format HH:MM:SS,mmm or HH:MM:SS.mmm or MM:SS,mmm
  const normalized = str.replace(",", ".");
  const parts = normalized.split(":");

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`Invalid timestamp format: ${str}`);
    }
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    if (isNaN(minutes) || isNaN(seconds)) {
      throw new Error(`Invalid timestamp format: ${str}`);
    }
    return minutes * 60 + seconds;
  } else if (parts.length === 1) {
    const seconds = parseFloat(parts[0]);
    if (isNaN(seconds)) {
      throw new Error(`Invalid timestamp format: ${str}`);
    }
    return seconds;
  }

  throw new Error(`Cannot parse timestamp: ${str}`);
}

export function formatSecondsToSrtTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const millis = Math.round((safeSeconds % 1) * 1000);

  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

export function formatSecondsToAssTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const centis = Math.round((safeSeconds % 1) * 100);

  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  return `${hours}:${pad(minutes)}:${pad(seconds)}.${pad(centis, 2)}`;
}

export function formatSecondsToFilenameTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}m${String(secs).padStart(2, "0")}s`;
}
