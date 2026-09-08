export type ViralClipperRoute = "caption-to-short" | "long-video-clip";

export interface SrtEntry {
  index: number;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface HighlightClipSpec {
  id?: string;
  title: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  description?: string;
}

export interface CaptionToShortInput {
  route: "caption-to-short";
  scriptText: string;
  title?: string;
  audioPath?: string; // Optional pre-synthesized audio track
  backgroundVideoPath?: string; // Optional background video loop/clip
  outputDir?: string;
  filename?: string;
  language?: string;
  fontName?: string;
}

export interface LongVideoClipInput {
  route: "long-video-clip";
  videoPath: string;
  srtPath?: string;
  srtContent?: string;
  clips?: HighlightClipSpec[];
  outputDir?: string;
  language?: string;
  fontName?: string;
  reframeToVertical?: boolean;
}

export type ViralClipperInput = CaptionToShortInput | LongVideoClipInput;

export interface SocialPostCopy {
  platform: "instagram_reels" | "youtube_shorts" | "tiktok";
  title: string;
  caption: string;
  hashtags: string[];
}

export interface RenderedClipResult {
  clipId: string;
  title: string;
  videoPath: string;
  srtPath?: string;
  durationSeconds: number;
  socialPackages: SocialPostCopy[];
}

export interface ViralClipperOutput {
  success: boolean;
  route: ViralClipperRoute;
  renderedClips: RenderedClipResult[];
  summary: string;
  capabilities: PreflightCapabilities;
  warnings?: string[];
}

export interface PreflightCapabilities {
  hasFfmpeg: boolean;
  hasWhisper: boolean;
  hasTts: boolean;
  ffmpegVersion?: string;
  missingCapabilities: string[];
}
