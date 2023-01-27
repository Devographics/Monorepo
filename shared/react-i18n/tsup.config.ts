import { defineConfig } from "tsup";
import path from "path";

const commonConfig = {
  clean: true,
  // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
  // dts: true,
  sourcemap: true,
  tsconfig: path.resolve(__dirname, "./tsconfig.build.json"),
};
export default defineConfig([
  {
    entry: ["index.ts"],
    ...commonConfig,
    format: ["esm"],
    outDir: "dist",
  },
  /*
  {
    entry: ["server/index.ts"],
    ...commonConfig,
    format: ["esm"],
    outDir: "dist/server",
  },*/
  /*
  No client-specific code yet
  {
    entry: ["client/index.ts"],
    ...commonConfig,
    format: ["esm", "iife"],
    outDir: "dist/client",
  },*/
]);
