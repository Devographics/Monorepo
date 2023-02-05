const path = require("path")
const { locales } = require("./src/i18n/data/locales");
const { extendNextConfig } = require("./packages/@vulcanjs/next-config");
// Use @next/mdx for a basic MDX support.
// See the how Vulcan Next docs are setup with next-mdx-remote
// which is more advanced (loading remote MD, supporting styling correctly etc.)
const withPkgInfo = require("./.vn/nextConfig/withPkgInfo");

const flowRight = require("lodash/flowRight");
const debug = require("debug")("vns:next");

// Pass the modules that are written directly in TS here
const withTM = require('next-transpile-modules')(['@devographics/core-models',
  '@devographics/react-form',
  '@devographics/react-i18n',
  '@devographics/swr-graphql']);


// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
const moduleExports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next/dist/next-server/server/config').NextConfig}
   **/
  let extendedConfig;
  extendedConfig = extendNextConfig(defaultConfig);

  //*** I18n redirections
  // @see https://nextjs.org/docs/advanced-features/i18n-routing
  const localeIds = locales.map((l) => l.id);
  const countryIds = localeIds.map((l) => l.slice(0, 2));
  const uniqueLocales = [...new Set([...localeIds, ...countryIds]).values()];
  extendedConfig.i18n = {
    locales: uniqueLocales,
    // It won't be prefixed
    defaultLocale: "en-US", //-US",
  };

  //*** Env variables (TODO: move to config)
  extendedConfig.env = {
    NEXT_PUBLIC_IS_USING_DEMO_DATABASE: !!(process.env.MONGO_URI || "").match(
      /lbke\-demo/
    ),
    NEXT_PUBLIC_IS_USING_LOCAL_DATABASE: !!(process.env.MONGO_URI || "").match(
      /localhost/
    ),
  };

  //*** */ Yaml support
  extendedConfig.webpack = function (config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: "js-yaml-loader",
    });
    config.experiments.topLevelAwait = true;
    return config;
  };

  // Disable linting during build => the linter may have optional dev dependencies
  // (eslint-plugin-cypress) that wont exist during prod build
  // You should lint manually only
  extendedConfig.eslint = {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  };

  // To support markdown import
  extendedConfig.pageExtensions = ["js", "jsx", "md", "mdx", "ts", "tsx"];

  extendedConfig.experimental = {
    ...(extendNextConfig.experimental || {}),
    outputFileTracingRoot: path.join(__dirname, '../'),
  }

  // Finally add relevant webpack configs/utils
  extendedConfig = flowRight([
    withTM,
    withPkgInfo,
    // add other wrappers here
  ])(extendedConfig);

  debug("Extended next config FINAL " + JSON.stringify(extendedConfig));

  return extendedConfig;
};

module.exports = moduleExports;
