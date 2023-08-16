/**
 * Keep in sync with ogserve/tsup.config.ts
 * 
 * Tsup takes care of transpiling and bundling our app
 * but also the shared packages that are provided as-is (as untranspiled, unbundled TS files)
 */
import { defineConfig } from "tsup";
import path from "path";
// Needed by devographics shared package that load yml configs
import yamlPluginPkg from 'esbuild-plugin-yaml'
const { yamlPlugin } = yamlPluginPkg

const commonConfig = {
    clean: true,
    splitting: false,
    // Skip until .d.ts.map is also supported https://github.com/egoist/tsup/issues/564
    // dts: true,
    sourcemap: true,
    tsconfig: path.resolve(__dirname, "./tsconfig.json"),
};
export default defineConfig([
    {
        esbuildPlugins: [yamlPlugin({})],
        entry: ["./src/app.ts"],
        ...commonConfig,
        format: ["esm"],
        outDir: "dist",
        /**
         * Shared packages expose their code as ts
         * Marking them as not being external will force their transpilation
         * the current app (we expect consistent TS versions across the monorepo)
         */
        noExternal: [
            /\@devographics\/*/,
        ]
    },
]);