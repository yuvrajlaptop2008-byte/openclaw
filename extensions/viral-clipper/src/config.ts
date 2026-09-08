export interface ViralClipperPluginConfig {
  outputDir?: string;
  fontName?: string;
  defaultLanguage?: string;
}

export const viralClipperConfigSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    outputDir: {
      type: "string",
      description: "Directory for local render outputs and post packages.",
    },
    fontName: {
      type: "string",
      description: "Optional default font name for ASS subtitle formatting.",
    },
    defaultLanguage: {
      type: "string",
      default: "en",
    },
  },
};

export function resolveViralClipperPluginConfig(config: unknown): ViralClipperPluginConfig {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { defaultLanguage: "en" };
  }

  const cfg = config as Record<string, unknown>;
  return {
    outputDir: typeof cfg.outputDir === "string" ? cfg.outputDir.trim() : undefined,
    fontName: typeof cfg.fontName === "string" ? cfg.fontName.trim() : undefined,
    defaultLanguage: typeof cfg.defaultLanguage === "string" ? cfg.defaultLanguage.trim() : "en",
  };
}
