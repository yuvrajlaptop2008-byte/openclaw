---
name: viral-clipper
description: Autopilot viral clipper plugin for short-form social video production (caption-to-short and long-video highlight clipping for Instagram Reels, YouTube Shorts, and TikTok).
---

The `viral_clipper` tool provides autopilot short-form video creation and long-video highlight extraction.

### Capabilities & Routes

1. **Caption-to-Short Route**:
   - Takes a topic, spoken script, or caption text.
   - Synthesizes narration audio, renders vertical 9:16 video (H.264/AAC), burns time-aligned ASS subtitles, and generates tailored post-package metadata (title, caption, hashtags for Instagram Reels, YouTube Shorts, and TikTok).

2. **Long-Video Clipping Route**:
   - Takes a long video source path and timestamp evidence or transcript (SRT file or Whisper transcript).
   - Identifies high-impact highlight moments, crops time ranges, reframes to 9:16 vertical layout, burns ASS captions, and outputs individual clip files along with social copy packages.

### Rules & Guidance
- **Safety Boundary**: This tool renders media and packages social copy locally. It **never** publishes or uploads to public platforms without explicit user action outside this tool.
- **Preflight Checks**: Preflight validates local binaries (FFmpeg, Whisper, TTS engines) before executing heavy renders.
- **Multilingual Support**: Preserves original languages and unicode characters in scripts and captions.
- **Deterministic Renders**: Rejects path collisions and produces clean, self-contained render artifacts in the target workspace.
