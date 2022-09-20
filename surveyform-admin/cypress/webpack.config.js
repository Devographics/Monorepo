// @see https://github.com/cypress-io/cypress-webpack-preprocessor/tree/master/examples/use-ts-loader
const path = require("path");
const extendWebpackConfig = require("../packages/@vulcanjs/webpack/extendWebpackConfig");
// Needed when a subdependency of Next is using process.env
const nextConfig = require("../next.config.js");
const { DefinePlugin } = require("webpack");

const config = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.ya?ml$/,
        use: "js-yaml-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: ["node_modules"],
    alias: {
      "#": path.join(__dirname, "."),
    },
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  // @see packages/next/build/webpack-config.ts in Next
  plugins: [
    /**  This plugin let's us define some env variables in packages
     This is needed for @sentry/next for instance
     @see https://github.com/vercel/next.js/discussions/9133#discussioncomment-82780
     */
    new DefinePlugin({
      /*
        ...Object.keys(process.env).reduce(
          (prev, key) => {
            if (key.startsWith('NEXT_PUBLIC_')) {
              prev[`process.env.${key}`] = JSON.stringify(process.env[key]!)
            }
            return prev
          },
          {}
        ),*/
      //"process.env":
      //  "Please define any relevant variable in cypress/webpack.config.js",
      "process.env.__NEXT_SCROLL_RESTORATION": false,
      "process.env.__NEXT_TRAILING_SLASH": JSON.stringify(
        nextConfig.trailingSlash
      ),
      "process.env.__NEXT_ROUTER_BASEPATH": JSON.stringify(nextConfig.basePath),
      "process.env.__NEXT_HAS_REWRITES": false, //JSON.stringify(hasRewrites),
      "process.env.__NEXT_I18N_SUPPORT": JSON.stringify(!!nextConfig.i18n),
      "process.env.__NEXT_I18N_DOMAINS": JSON.stringify(
        nextConfig.i18n?.domains
      ),
      "process.env.__NEXT_ANALYTICS_ID": JSON.stringify(nextConfig.analyticsId),
    }),
  ],
};

const extended = extendWebpackConfig()(config);

module.exports = extended;
