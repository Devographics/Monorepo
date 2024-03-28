import React from 'react'
import Avatar from 'core/components/Avatar'
import { Entity } from '@devographics/types'
import { UserIcon } from 'core/icons'
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
        name: 'twitter',
        icon: TwitterIcon
    },
    {
        name: 'homepage',
        icon: LinkIcon
    },
    {
        name: 'blog',
        icon: BlogIcon
    },
    {
        name: 'rss',
        icon: RSSIcon
    },
    {
        name: 'github',
        icon: GitHubIcon
    },
    {
        name: 'npm',
        icon: NpmIcon
    },
    {
        name: 'mastodon',
        icon: MastodonIcon
    },
    {
        name: 'youtube',
        icon: YouTubeIcon
    },
    {
        name: 'twitch',
        icon: TwitchIcon
    }
]

export const getSocialLinks = (entity: Entity) => {
    const links: Array<any> = []
    services.forEach(service => {
        const serviceData = entity[service.name as keyof Entity]
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

export const PeopleModal = ({ entity }: LabelProps) => (
    <div>
        <h3 className="item-modal-name">{entity.name}</h3>
        <ul className="item-modal-links">
            {getSocialLinks(entity).map(({ name, url, icon }, index) => (
                <LinkItem key={name} name={name} url={url} icon={icon} />
            ))}
        </ul>
    </div>
)

const LinkItem = ({
    name,
    url,
    icon: Icon
}: {
    name: string
    url: string
    icon: ServiceDefinition['icon']
}) => (
    <li className="item-modal-links-item">
        <a className="item-modal-links-item-link" href={url} target="_blank" rel="noreferrer">
            {Icon && <Icon size="small" labelId={`blocks.entity.${name}_link`} />}
            <T k={`blocks.entity.${name}_link`} />
        </a>
    </li>
)
