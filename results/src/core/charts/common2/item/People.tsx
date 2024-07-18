import React from 'react'
import Avatar from 'core/components/Avatar'
import { Entity } from '@devographics/types'
import { MDNIcon, UserIcon } from 'core/icons'
import { LabelProps, ServiceDefinition } from './types'
import {
    LinkIcon,
    NpmIcon,
    TwitterIcon,
    GitHubIcon,
    MastodonIcon,
    YouTubeIcon,
    TwitchIcon,
    RSSIcon,
    BlogIcon
} from 'core/icons'
import T from 'core/i18n/T'

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
    }
]

export const getSocialLinks = (entity: Entity) => {
    const links: Array<any> = []
    services.forEach(service => {
        const serviceData = entity[service.service as keyof Entity]
        if (serviceData) {
            links.push({ ...service, ...serviceData })
        }
    })
    // const homepageLink = links.find(({ name }) => name === 'homepage')

    // const linksWithoutHomepage = links.filter(({ name }) => name !== 'homepage')
    // const homepageLinkIsSameAsOtherLink = linksWithoutHomepage.some(
    //     ({ url }) => url === homepageLink?.url
    // )
    // if (homepageLinkIsSameAsOtherLink) {
    //     homepageLink.url = null
    // }
    return links
}

export const PeopleIcon = ({ entity }: LabelProps) =>
    entity?.avatar?.url ? <Avatar entity={entity} size={30} /> : <UserIcon />

export const PeopleModal = ({ entity }: LabelProps) => {
    const { alias, name } = entity
    return (
        <div>
            <h3 className="item-name">{alias ? `${alias} (${name})` : name}</h3>
            <ul className="item-links">
                <ItemLinks entity={entity} />
            </ul>
        </div>
    )
}

export const ItemLinks = ({ entity }: { entity: Entity }) => {
    const links = getSocialLinks(entity)
    return (
        <ul className="item-links">
            {links.map(({ service, url, icon }, index) => (
                <LinkItem key={service} service={service} url={url} icon={icon} />
            ))}
        </ul>
    )
}

export const LinkItem = ({
    service,
    url,
    icon: Icon
}: {
    service: string
    url: string
    icon: ServiceDefinition['icon']
}) => (
    <li className="item-links-item">
        <a className="item-links-item-link" href={url} target="_blank" rel="noreferrer">
            {Icon && <Icon size="small" labelId={`blocks.entity.${service}_link`} />}
            <T k={`blocks.entity.${service}_link`} />
        </a>
    </li>
)
