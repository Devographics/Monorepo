const util = require("util");
const { extendNextConfig } = require("./packages/@vulcanjs/next-config");
// Use @next/mdx for a basic MDX support.
// See the how Vulcan Next docs are setup with next-mdx-remote
// which is more advanced (loading remote MD, supporting styling correctly etc.)
const withPkgInfo = require("./.vn/nextConfig/withPkgInfo");

const flowRight = require("lodash/flowRight");
const debug = require("debug")("devographics:next");

const { withSentryConfig } = require("@sentry/nextjs");

// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
const moduleExports = (phase, { defaultConfig }) => {
  console.log("defaultConfig", defaultConfig);

  /**
   * @type {import('next/dist/next-server/server/config').NextConfig}
   **/
  let nextConfig = {
    // NOTE: the doc is unclear about whether we should merge this default config or not
    ...defaultConfig,
    experimental: {
      appDir: true,
    },
    transpilePackages: ["@devographics/core-models", "@devographics/react-hooks"],
    // Disable linting during build => the linter may have optional dev dependencies
    // (eslint-plugin-cypress) that wont exist during prod build
    // You should lint manually only
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    /*
    i18n: {
      locales: uniqueLocales,
      // It won't be prefixed
      defaultLocale: "en-US", //-US",

    },*/
    env: {
      NEXT_PUBLIC_IS_USING_DEMO_DATABASE: !!(process.env.MONGO_URI || "").match(
        /lbke\-demo/
      ),
      NEXT_PUBLIC_IS_USING_LOCAL_DATABASE: !!(
        process.env.MONGO_URI || ""
      ).match(/localhost/),
    },
    webpack: function (configArg, ...otherArgs) {
      //console.log(util.inspect(configArg.module.rules, false, null, true));
      //*** */ Yaml support
      // run previously configured function!
      const config = defaultConfig.webpack
        ? defaultConfig.webpack(configArg, ...otherArgs)
        : configArg;
      // then extend
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: "js-yaml-loader",
      });

      config.experiments.topLevelAwait = true;
      return config;
    },

    /*
    Don't seem to be needed
    sassOptions: {
      includePaths: [path.join(__dirname, "src/stylesheets")],
    },
    */

    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "devographics.github.io",
        },
      ],
    },

    // uncomment to support markdown
    // pageExtensions:["js", "jsx", "md", "mdx", "ts", "tsx"];
  };

  let extendedConfig = extendNextConfig(nextConfig);

  //*** */ Enable Webpack analyzer
  if (process.env.ANALYZE) {
    const debug = require("debug")("webpack");
    debug("Enabling Webpack bundle analyzer");
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: !!process.env.ANALYZE,
    });
    extendedConfig = withBundleAnalyzer(extendedConfig);
  }

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
    withPkgInfo,
    //withMDX,
    (config) => withSentryConfig(config, sentryWebpackPluginOptions),
    // add other wrappers here
  ])(extendedConfig);

  debug("Extended next config FINAL " + JSON.stringify(extendedConfig));

  if (process.env.MAINTENANCE_MODE) {
    extendedConfig.redirects = async () => {
      return [
        {
          source: '/',
          destination: '/maintenance',
          permanent: false,
        },
        {
          source: '/((?!maintenance|_next|api).*)',
          destination: '/maintenance',
          permanent: false,
        },
      ]
    }
  }

  return extendedConfig;
};

module.exports = moduleExports;
