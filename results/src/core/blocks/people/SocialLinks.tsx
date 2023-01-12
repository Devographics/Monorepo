import React from 'react'
import styled from 'styled-components'
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
import { spacing, mq, fontSize } from 'core/theme'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'

export const socialLinks = [
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
    // {
    //     name: 'github',
    //     icon: GitHubIcon
    // },
    // {
    //     name: 'npm',
    //     icon: NpmIcon
    // },
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

export const getSocialLinks = entity => {
    const links = socialLinks.map(service => ({ ...service, url: entity?.[service.name]?.url }))
    const homepageLink = links.find(({ name }) => name === 'homepage')

    const linksWithoutHomepage = links.filter(({ name }) => name !== 'homepage')
    const homepageLinkIsSameAsOtherLink = linksWithoutHomepage.some(
        ({ url }) => url === homepageLink?.url
    )
    if (homepageLinkIsSameAsOtherLink) {
        homepageLink.url = null
    }
    return links
}

const SocialLinks = ({ entity }) => {
    return (
        <SocialLinks_>
            {getSocialLinks(entity).map(({ name, url, icon }, index) =>
                url ? (
                    <LinkItem key={name} index={index} name={name} url={url} icon={icon} />
                ) : (
                    <EmptyItem_ key={name} />
                )
            )}
        </SocialLinks_>
    )
}

const LinkItem = ({ name, url, icon: Icon, index }) => (
    <Link_ href={url} target="_blank" rel="noreferrer">
        {Icon ? <Icon size="small" labelId={`blocks.entity.${name}_link`} /> : name}
    </Link_>
)

const Link_ = styled.a`
    padding: ${spacing(0.5)};
`

const EmptyItem_ = styled.div`
    height: 8px;
    width: 8px;
    border-radius: 100%;
    background: ${({ theme }) => theme.colors.background};
`

const SocialLinks_ = styled.div`
    /* display: flex; */
    /* gap: ${spacing()}; */
    /* align-items: center; */
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
    place-items: center;
`

export default SocialLinks
