import { describe, it, expect, vi } from "vitest";
import pluginEntry from "./index.js";
import { registerViralClipperPlugin } from "./src/plugin.js";

describe("viral-clipper plugin entry", () => {
  it("defines plugin metadata correctly", () => {
    expect(pluginEntry.id).toBe("viral-clipper");
    expect(pluginEntry.name).toBe("Viral Clipper");
    expect(pluginEntry.configSchema).toBeDefined();
  });

  it("registers viral_clipper tool with api", () => {
    const registerTool = vi.fn();
    const mockApi: any = {
      registerTool,
      pluginConfig: {},
      runtime: {
        config: {
          current: () => ({}),
        },
      },
    };

    registerViralClipperPlugin(mockApi);
    expect(registerTool).toHaveBeenCalledWith(expect.any(Function), {
      name: "viral_clipper",
    });
  });
});
