//const util = require("util");
const { extendNextConfig } = require("./packages/@vulcanjs/next-config");
// Use @next/mdx for a basic MDX support.
// See the how Vulcan Next docs are setup with next-mdx-remote
// which is more advanced (loading remote MD, supporting styling correctly etc.)
const withPkgInfo = require("./.vn/nextConfig/withPkgInfo");

const flowRight = require("lodash/flowRight");
const debug = require("debug")("devographics:next");

// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
const moduleExports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next/dist/next-server/server/config').NextConfig}
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
      "@devographics/react-hooks",
      "@devographics/react-form",
      "@devographics/types",
    ],
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

      config.module.rules.push({
        test: /\.node$/,
        use: "node-loader",
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
        {
          protocol: "https",
          hostname: "static.devographics.com",
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

  // Finally add relevant webpack configs/utils
  extendedConfig = flowRight([
    withPkgInfo,
  ])(extendedConfig);

  debug("Extended next config FINAL " + JSON.stringify(extendedConfig));

  if (process.env.MAINTENANCE_MODE) {
    extendedConfig.redirects = async () => {
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

  return extendedConfig;
};

module.exports = moduleExports;
