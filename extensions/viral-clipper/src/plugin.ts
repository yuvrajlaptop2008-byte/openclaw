import { Type } from "typebox";
import { resolveLivePluginConfigObject } from "openclaw/plugin-sdk/plugin-config-runtime";
import type { OpenClawConfig, OpenClawPluginApi } from "./api.js";
import { resolveViralClipperPluginConfig } from "./config.js";
import { executeViralClipper } from "./clipper-engine.js";
import type { ViralClipperInput } from "./types.js";

const HighlightClipSchema = Type.Object({
  id: Type.Optional(Type.String({ description: "Optional clip identifier." })),
  title: Type.String({ description: "Title of the highlight clip." }),
  startTime: Type.Number({ description: "Start time in seconds." }),
  endTime: Type.Number({ description: "End time in seconds." }),
  description: Type.Optional(Type.String({ description: "Short description of the clip." })),
});

export const ViralClipperToolParamsSchema = Type.Object({
  route: Type.Union([Type.Literal("caption-to-short"), Type.Literal("long-video-clip")], {
    description: "Viral clipper route to execute.",
  }),
  scriptText: Type.Optional(
    Type.String({ description: "Spoken script or topic text for caption-to-short route." })
  ),
  title: Type.Optional(Type.String({ description: "Title for the output clip or post." })),
  audioPath: Type.Optional(
    Type.String({ description: "Optional pre-synthesized audio track path for caption-to-short." })
  ),
  backgroundVideoPath: Type.Optional(
    Type.String({ description: "Optional background video path for caption-to-short." })
  ),
  videoPath: Type.Optional(
    Type.String({ description: "Source long video file path for long-video-clip route." })
  ),
  srtPath: Type.Optional(
    Type.String({ description: "Path to existing SRT captions file." })
  ),
  srtContent: Type.Optional(
    Type.String({ description: "Raw SRT captions string content." })
  ),
  clips: Type.Optional(
    Type.Array(HighlightClipSchema, {
      description: "List of highlight clip time ranges and titles.",
    })
  ),
  outputDir: Type.Optional(
    Type.String({ description: "Target workspace directory for local renders." })
  ),
  language: Type.Optional(
    Type.String({ description: "Content language code (e.g. 'en', 'es'). Default 'en'." })
  ),
  fontName: Type.Optional(
    Type.String({ description: "Font name for ASS subtitle formatting." })
  ),
  reframeToVertical: Type.Optional(
    Type.Boolean({ description: "Whether to crop/reframe video to 9:16 vertical. Default true." })
  ),
});

export function registerViralClipperPlugin(api: OpenClawPluginApi): void {
  const resolveCurrentPluginConfig = () =>
    resolveLivePluginConfigObject(
      api.runtime.config?.current
        ? () => api.runtime.config.current() as OpenClawConfig
        : undefined,
      "viral-clipper",
      api.pluginConfig as Record<string, unknown>
    ) ?? {};

  api.registerTool(
    () => {
      const pluginConfig = resolveViralClipperPluginConfig(resolveCurrentPluginConfig());

      return {
        name: "viral_clipper",
        displayName: "Viral Clipper",
        description:
          "Autopilot short-form video creator and long-video highlight clipper for Instagram Reels, YouTube Shorts, and TikTok.",
        parameters: ViralClipperToolParamsSchema,
        async execute(params: any) {
          const input: ViralClipperInput = {
            ...params,
            fontName: params.fontName || pluginConfig.fontName,
            language: params.language || pluginConfig.defaultLanguage,
          };

          const result = await executeViralClipper(input, pluginConfig.outputDir);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            details: result,
          };
        },
      };
    },
    {
      name: "viral_clipper",
    }
  );
}
