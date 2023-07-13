import path from "path";
// Use @next/mdx for a basic MDX support.
// See the how Vulcan Next docs are setup with next-mdx-remote
// which is more advanced (loading remote MD, supporting styling correctly etc.)
import withPkgInfo from "./.vn/nextConfig/withPkgInfo.mjs";
import flowRight from "lodash/flowRight.js";
import { withSentryConfig } from "@sentry/nextjs";
import debug_ from "debug";
import bundleAnalyzer from "@next/bundle-analyzer";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const debug = debug_("devographics:next");

// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
const moduleExports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next/dist/server/config').NextConfig}
   **/
  let nextConfig = {
    // NOTE: the doc is unclear about whether we should merge this default config or not
    ...defaultConfig,
    experimental: {
      appDir: true,
      instrumentationHook: true,
    },
    transpilePackages: [
      "@devographics/permissions",
      "@devographics/core-models",
      "@devographics/react-hooks",
      "@devographics/react-form",
    ],
    // Disable linting during build => the linter may have optional dev dependencies
    // (eslint-plugin-cypress) that wont exist during prod build
    // You should lint manually only
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    env: {
      NEXT_PUBLIC_IS_USING_LOCAL_DATABASE: !!(
        process.env.MONGO_URI || ""
      ).match(/localhost/),
    },
    webpack: function (configArg, otherArgs) {
      // run previously configured function!
      /** @type {import("webpack").Configuration} */
      const config = defaultConfig.webpack
        ? defaultConfig.webpack(configArg, otherArgs)
        : configArg;
      // then extend
      config.module.rules.push({
        test: /\.ya?ml$/,
        use: "js-yaml-loader",
      });

      config.module.rules.push({
        test: /\.node$/,
        use: "node-loader",
      });

      // Support differentiated import for the same folder
      if (!config.resolve.mainFiles) {
        config.resolve.mainFiles = [
          "index.js",
          "index.ts",
          "index.jsx",
          "index.tsx",
        ];
      }
      if (otherArgs.isServer) {
        config.resolve.mainFiles.push(
          "index.server.ts",
          "index.server.tsx",
          "index.server.js",
          "index.server.jsx"
        );
      } else {
        config.resolve.mainFiles.push(
          "index.client.ts",
          "index.client.tsx",
          "index.client.js",
          "index.client.jsx"
        );
      }
      if (!config.resolve) config.resolve = {};
      // This is still needed for Storybook or 3rd party Webpack baseds tools
      // However Next is able to resolve based just on the tsconfig.json
      // @see https://github.com/vercel/next.js/issues/19345 for progress on this
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "~": path.join(__dirname, "src"),
      };

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
        {
          protocol: "https",
          hostname: "static.devographics.com",
        },
      ],
    },

    // uncomment to support markdown
    // pageExtensions:["js", "jsx", "md", "mdx", "ts", "tsx"];
  };
  //*** */ Enable Webpack analyzer
  if (process.env.ANALYZE) {
    const debug = debug_("webpack");
    debug("Enabling Webpack bundle analyzer");
    const withBundleAnalyzer = bundleAnalyzer({
      enabled: !!process.env.ANALYZE,
    });
    nextConfig = withBundleAnalyzer(nextConfig);
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
  nextConfig.sentry = {
    ...(nextConfig.sentry || {}),
    // Will disable source map upload
    disableServerWebpackPlugin: shouldDisableSentry,
    disableClientWebpackPlugin: shouldDisableSentry,
  };

  // Finally add relevant webpack configs/utils
  nextConfig = flowRight([
    withPkgInfo,
    //withMDX,
    (config) => withSentryConfig(config, sentryWebpackPluginOptions),
    // add other wrappers here
  ])(nextConfig);

  debug("Extended next config FINAL " + JSON.stringify(nextConfig));

  if (process.env.MAINTENANCE_MODE) {
    nextConfig.redirects = async () => {
      return [
        {
          source: "/",
          destination: "/maintenance",
          permanent: false,
        },
        {
          source: "/((?!maintenance|_next|api).*)",
          destination: "/maintenance",
          permanent: false,
        },
      ];
    };
  }

  return nextConfig;
};

export default moduleExports;
