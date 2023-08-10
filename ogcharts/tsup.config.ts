import { defineConfig } from "tsup";
import path from "path";

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
        entry: ["./src/app.ts"],
        ...commonConfig,
        format: ["esm"],
        outDir: "dist",
    },
]);