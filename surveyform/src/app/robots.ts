import { MetadataRoute } from 'next'
import { serverConfig } from '~/config/server'

const host = serverConfig().appUrl

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/account/',
                '/api/',
                '/debug/',
                '/maintenance/'
            ],
        },
        host,
        sitemap: host + '/sitemap.xml',
    }
}