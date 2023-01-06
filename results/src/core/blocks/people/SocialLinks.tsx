import React from 'react'
import styled from 'styled-components'
import {
    LinkIcon,
    NpmIcon,
    TwitterIcon,
    GitHubIcon,
    MastodonIcon,
    YouTubeIcon,
    TwitchIcon
} from 'core/icons'
import { spacing, mq, fontSize } from 'core/theme'

export const socialLinks = [
    // { name: 'homepage', icon: LinkIcon },
    {
        name: 'github',
        icon: GitHubIcon
    },
    {
        name: 'twitter',
        icon: TwitterIcon
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

export const getSocialLinks = entity =>
    socialLinks
        .map(service => ({ ...service, url: entity?.[service.name]?.url }))
        .filter(({ url }) => url)

const SocialLinks = ({ entity }) => {
    console.log(entity)
    console.log(getSocialLinks(entity))
    return (
        <SocialLinks_>
            {getSocialLinks(entity).map(({ name, url, icon }, index) => (
                <LinkItem key={name} index={index} name={name} url={url} icon={icon} />
            ))}
        </SocialLinks_>
    )
}

const LinkItem = ({ name, url, icon: Icon, index }) => (
    <a href={url} target="_blank" rel="noreferrer">
        {Icon ? <Icon labelId={`blocks.entity.${name}_link`} /> : name}
    </a>
)

const SocialLinks_ = styled.div`
    display: flex;
    gap: ${spacing()};
`

export default SocialLinks
