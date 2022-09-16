const { locales } = require("./src/i18n/data/locales");
const { extendNextConfig } = require("./packages/@vulcanjs/next-config");
// Use @next/mdx for a basic MDX support.
// See the how Vulcan Next docs are setup with next-mdx-remote
// which is more advanced (loading remote MD, supporting styling correctly etc.)
const withMDX = require("@next/mdx")({ extension: /\.mdx?$/ });
const withPkgInfo = require("./.vn/nextConfig/withPkgInfo");

const flowRight = require("lodash/flowRight");
const debug = require("debug")("vns:next");

const { withSentryConfig } = require("@sentry/nextjs");

// Pass the modules that are written directly in TS here
const withTM = require('next-transpile-modules')(['@devographics/core-models']);


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

  //*** */ Enable Webpack analyzer
  if (process.env.ANALYZE && process.env.ANALYZE !== "false") {
    const debug = require("debug")("webpack");
    debug("Enabling Webpack bundle analyzer");
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: process.env.ANALYZE === "true",
    });
    extendedConfig = withBundleAnalyzer(extendedConfig);
  }

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

  //*** Sentry
  /**
   * Disable source map upload
   */
  let shouldDisableSentry = undefined;
  if (
    process.env.NODE_ENV === "development" ||
    !!process.env.SKIP_SENTRY_SOURCEMAP_UPLOAD
  ) {
    shouldDisableSentry = true;
  }
  if (process.env.NODE_ENV === "production") {
    if (!process.env.SENTRY_AUTH_TOKEN) {
      console.warn(
        "SENTRY_AUTH_TOKEN not provided while building for production.\
       Ignore this warning if you are building locally."
      );
      shouldDisableSentry = true;
    }
    if (!process.env.SENTRY_PROJECT) {
      console.warn(
        "No Sentry project set. This is expected for Vercel preview deployments, but shouldn't happen with the main branch."
      );
      shouldDisableSentry = true;
    }
  }
  if (process.env.SKIP_SENTRY_SOURCEMAP_UPLOAD) {
    console.info(
      "Source map upload disabled for Sentry via SKIP_SENTRY_SOURCEMAP_UPLOAD"
    );
  }
  if (!shouldDisableSentry) {
    console.info(
      "Will upload sourcemaps to Sentry. Set SKIP_SENTRY_SOURCEMAP_UPLOAD=1 to skip."
    );
  }
  const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
    // Will disable release creation and source map upload during local dev
    dryRun: shouldDisableSentry,
    disableServerWebpackPlugin: shouldDisableSentry,
    disableClientWebpackPlugin: shouldDisableSentry,
  };
  extendedConfig.sentry = {
    ...(extendedConfig.sentry || {}),
    // Will disable source map upload
    disableServerWebpackPlugin: shouldDisableSentry,
    disableClientWebpackPlugin: shouldDisableSentry,
  };

  // Finally add relevant webpack configs/utils
  extendedConfig = flowRight([
    withTM,
    withPkgInfo,
    withMDX,
    (config) => withSentryConfig(config, sentryWebpackPluginOptions),
    // add other wrappers here
  ])(extendedConfig);

  debug("Extended next config FINAL " + JSON.stringify(extendedConfig));

  return extendedConfig;
};

module.exports = moduleExports;
