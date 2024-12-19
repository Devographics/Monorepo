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
    async headers() {
        return [
            {
                source: '/share/prerendered',
                headers: [
                    {
                        key: 'Cache-Control',
                        // redirections can be publicly cached for 1 minute, 
                        // and an old version can be served for one more minute until the new one is up
                        value: 's-maxage=60, stale-while-revalidate=59',
                    },
                ],
            },
        ];
    },
    redirects: {
        source: "/share/fly",
        destination: "/share/prerendered",
        permanent: false
    }
}

module.exports = nextConfig
