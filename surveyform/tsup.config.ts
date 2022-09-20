/**
 * Tsup is used to bundle scripts outside of Next.js,
 * ie that will run on server "start".
 *
 * Those script can still import our models, or any non Next specific code.
 */
import { defineConfig } from "tsup";
import path from "path";

import yamlPluginDefault from "esbuild-plugin-yaml";
const yamlPlugin = yamlPluginDefault.yamlPlugin;

const commonConfig = {
  clean: true,
  splitting: false,
  // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
  // dts: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.tsup.json"),
  outDir: "scripts/dist",
  name: "",
  platform: "node" as const,
  target: "node14",
  // TODO: remove "~" from noExternal, remove external,
  // and use "tsup-node" instead of "tsup" when this
  // PR lands in:
  // @see https://github.com/egoist/tsup/issues/718
  // @see https://github.com/egoist/tsup/pull/720
  noExternal: [/^@devographics($|\/)/, /^~/],
  external: [/^[^.\/]|^\.[^.\/]|^\.\.[^\/]/],
  esbuildPlugins: [yamlPlugin({})],
};
export default defineConfig([
  // We need 3 configs instead of 3 entries
  // so that all scripts are stored at the root of "/dist" folder
  {
    // Register your TS scripts here (custom scripts)
    entry: ["./scripts/onServerStart.ts"],
    format: ["esm"],
    ...commonConfig,
  },
  {
    entry: ["./.vn/scripts/ts-sources/db/seed.ts"],
    format: ["esm"],
    ...commonConfig,
  },
  {
    entry: ["./.vn/scripts/ts-sources/db/reset.ts"],
    format: ["esm"],
    ...commonConfig,
  },
]);
