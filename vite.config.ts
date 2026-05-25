// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Stub for the `tanstack-start-injected-head-scripts:v` virtual module.
// start-server-core 1.169 imports it in dev, but start-plugin-core's Vite path
// doesn't register it (only the rsbuild path does), so SSR crashes with
// ERR_MODULE_NOT_FOUND. Provide an empty module so the conditional no-ops.
function injectedHeadScriptsStub(): Plugin {
  const id = "tanstack-start-injected-head-scripts:v";
  const resolved = "\0" + id;
  return {
    name: "lovable:injected-head-scripts-stub",
    enforce: "pre",
    resolveId(source) {
      if (source === id) return resolved;
    },
    load(loadedId) {
      if (loadedId === resolved) return "export const injectedHeadScripts = '';";
    },
  };
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [injectedHeadScriptsStub()],
  },
});
