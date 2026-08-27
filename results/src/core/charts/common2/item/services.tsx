import {
    TwitterIcon,
    LinkIcon,
    BlogIcon,
    RSSIcon,
    GitHubIcon,
    NpmIcon,
    MastodonIcon,
    YouTubeIcon,
    TwitchIcon,
    MDNIcon,
    UserIcon,
    ThreadsIcon,
    BlueskyIcon,
    AmazonIcon,
    WikipediaIcon,
    SteamIcon
} from '@devographics/icons'
import { ServiceDefinition } from './types'

export const services: ServiceDefinition[] = [
    {
        service: 'twitter',
        icon: TwitterIcon
    },
    {
        service: 'homepage',
        icon: LinkIcon
    },
    {
        service: 'blog',
        icon: BlogIcon
    },
    {
        service: 'rss',
        icon: RSSIcon
    },
    {
        service: 'github',
        icon: GitHubIcon
    },
    {
        service: 'npm',
        icon: NpmIcon
    },
    {
        service: 'mastodon',
        icon: MastodonIcon
    },
    {
        service: 'youtube',
        icon: YouTubeIcon
    },
    {
        service: 'twitch',
        icon: TwitchIcon
    },
    {
        service: 'mdn',
        icon: MDNIcon
    },
    {
        service: 'caniuse',
        icon: UserIcon
    },
    {
        service: 'threads',
        icon: ThreadsIcon
    },
    {
        service: 'bluesky',
        icon: BlueskyIcon
    },
    {
        service: 'amazon',
        icon: AmazonIcon
    },
    {
        service: 'wikipedia',
        icon: WikipediaIcon
    },
    {
        service: 'steam',
        icon: SteamIcon
    }
]
