/**
 * We must extend the build configuration so it supports shared packages
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        // TODO: not sure it handles regex/globs
        "@devographics/*",
    ],
    webpack: (
        config,
        { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
    ) => {
        config.module.rules.push({
            test: /\.ya?ml$/,
            use: "js-yaml-loader",
        });
        // Important: return the modified config
        return config
    },
}

module.exports = nextConfig
