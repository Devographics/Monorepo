import fetch from 'node-fetch'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import { RequestContext } from '../types'
import { useCache } from '../helpers/caching'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

type YoutubeChannelIdentifier =
    | { type: 'id'; value: string }
    | { type: 'username'; value: string }
    | { type: 'handle'; value: string }

// non-channel top-level paths that can appear with no second segment,
// e.g. https://www.youtube.com/watch, so they must not be mistaken for
// a bare legacy custom URL like https://www.youtube.com/thecodercoder
const RESERVED_PATH_SEGMENTS = new Set([
    'watch',
    'playlist',
    'results',
    'feed',
    'embed',
    'shorts',
    'live',
    'about',
    'gaming',
    'premium',
    'trending',
    'account',
    'upload'
])

/**
 * Extract a channel identifier from any of the common YouTube URL formats:
 * - https://www.youtube.com/channel/UCxxxx (channel id)
 * - https://www.youtube.com/user/someUser (legacy username)
 * - https://www.youtube.com/@someHandle (handle)
 * - https://www.youtube.com/c/someName (custom url, looked up as a handle)
 * - https://www.youtube.com/someName (bare legacy custom url, looked up as a handle)
 */
export const parseYoutubeUrl = (youtubeUrl: string): YoutubeChannelIdentifier => {
    const { pathname } = new URL(youtubeUrl)
    const [first, second] = pathname.split('/').filter(Boolean)

    if (first === 'channel' && second) {
        return { type: 'id', value: second }
    }
    if (first === 'user' && second) {
        return { type: 'username', value: second }
    }
    if (first === 'c' && second) {
        return { type: 'handle', value: `@${second}` }
    }
    if (first?.startsWith('@')) {
        return { type: 'handle', value: first }
    }
    if (first && !second && !RESERVED_PATH_SEGMENTS.has(first)) {
        return { type: 'handle', value: `@${first}` }
    }
    throw new Error(`getYoutubeStats: could not parse channel identifier from URL ${youtubeUrl}`)
}

export async function getYoutubeStatsCached({
    url,
    key,
    context
}: {
    url: string
    key: string
    context: RequestContext
}) {
    const stats = useCache({
        func: getYoutubeStats,
        context,
        funcOptions: { url },
        key,
        enableCache: true
    })
    return stats
}

/**
 * Fetch all available stats for a YouTube channel from its page URL.
 * @see https://developers.google.com/youtube/v3/docs/channels/list
 */
export async function getYoutubeStats({ url }: { url: string }) {
    const apiKey = getEnvVar(EnvVar.YOUTUBE_API_KEY, {
        hardFail: true,
        calledFrom: 'getYoutubeStats'
    })
    let identifier
    try {
        identifier = parseYoutubeUrl(url)
    } catch (error) {
        console.log(error)
        return
    }

    const params = new URLSearchParams({ part: 'statistics', key: apiKey as string })
    if (identifier.type === 'id') {
        params.set('id', identifier.value)
    } else if (identifier.type === 'username') {
        params.set('forUsername', identifier.value)
    } else if (identifier.type === 'handle') {
        params.set('forHandle', identifier.value)
    }

    try {
        const res = await fetch(`${YOUTUBE_API_BASE}/channels?${params.toString()}`)
        const json: any = await res.json()

        if (json.error) {
            console.error(`getYoutubeStats error for ${url}:`, json.error.message)
            return
        }

        const channel = json.items?.[0]
        if (!channel) {
            console.warn(`getYoutubeStats: no channel found for ${url}`)
            return
        }

        const { viewCount, subscriberCount, hiddenSubscriberCount, videoCount } = channel.statistics

        const stats = {
            id: channel.id,
            subscribers: hiddenSubscriberCount ? undefined : Number(subscriberCount),
            subscribersHidden: Boolean(hiddenSubscriberCount),
            views: Number(viewCount),
            videos: Number(videoCount),
            generatedAt: new Date().toString()
        }
        return stats
    } catch (error) {
        console.error(`getYoutubeStats error for ${url}`)
        console.error(error)
    }
}
