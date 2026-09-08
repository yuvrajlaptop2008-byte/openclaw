import { definePluginEntry } from "./api.js";
import { viralClipperConfigSchema } from "./src/config.js";
import { registerViralClipperPlugin } from "./src/plugin.js";

export default definePluginEntry({
  id: "viral-clipper",
  name: "Viral Clipper",
  description: "Autopilot short-form video creator and long-video highlight clipper.",
  configSchema: viralClipperConfigSchema,
  register: registerViralClipperPlugin,
});
