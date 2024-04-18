import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import yaml from '@rollup/plugin-yaml';

installGlobals();

// preprocessor don't need a plugin @see https://vitejs.dev/guide/features#css-pre-processors
export default defineConfig({
  plugins: [remix(), yaml(), tsconfigPaths()],
});
