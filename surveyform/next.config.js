const path = require("path");
// Use @next/mdx for a basic MDX support.
// See the how Vulcan Next docs are setup with next-mdx-remote
// which is more advanced (loading remote MD, supporting styling correctly etc.)

// @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
const moduleExports = (phase, { defaultConfig }) => {
  /**
   * @type {import('next/dist/server/config').NextConfig}
   **/
  let nextConfig = {
    // NOTE: the doc is unclear about whether we should merge this default config or not
    ...defaultConfig,
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
      NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
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
    const withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: !!process.env.ANALYZE,
    });
    nextConfig = withBundleAnalyzer(nextConfig);
  }

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

module.exports = moduleExports;
