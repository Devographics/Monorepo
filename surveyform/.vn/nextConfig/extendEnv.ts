import { NextConfig } from "next";

const { extendNextConfig } = require("../../packages/@vulcanjs/next-config");
const flowRight = require("lodash/flowRight");
const debug = require("debug")("vns:next");
const packageJSON = require("../../package.json");

// fooBar => FOO_BAR
const camelToTitle = (camelStr: string): string => {
  return camelStr
    .replace(/[A-Z]/g, " $1") // fooBar => foo Bar
    .split(" ")
    .map((t) => t.toUpperCase())
    .join("_");
};

const withPkgInfo = (nextConfig) => {
  // Public
  // It's still unclear where such config should go
  // @see https://github.com/vercel/next.js/discussions/14308
  const publicPkgInfo = {
    version: packageJSON.version,
  };
  Object.entries(publicPkgInfo).map(([key, value]) => {
    const envKey = `NEXT_PUBLIC_PKGINFO_${camelToTitle(key)}`;
    nextConfig.env[envKey] = `${value}`; // we convert to string
  });

  return nextConfig;
};

// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
export default ({ defaultConfig }) => {
  let extendedConfig: NextConfig;
  extendedConfig = extendNextConfig(defaultConfig);

  extendedConfig.env = {};

  // Enable Webpack analyzer
  if (process.env.ANALYZE && process.env.ANALYZE !== "false") {
    const debug = require("debug")("webpack");
    debug("Enabling Webpack bundle analyzer");
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: process.env.ANALYZE === "true",
    });
    extendedConfig = withBundleAnalyzer(extendedConfig);
  }

  // To support markdown import
  extendedConfig.pageExtensions = ["js", "jsx", "md", "mdx", "ts", "tsx"];
  extendedConfig = flowRight([
    withPkgInfo,
    // add other wrappers here
  ])(extendedConfig);

  debug("Extended next config FINAL " + JSON.stringify(extendedConfig));

  return extendedConfig;
};
