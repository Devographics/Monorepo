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
    BlogIcon,
} from 'core/icons'
import { spacing, mq, fontSize } from 'core/theme'
import ButtonGroup from 'core/components/ButtonGroup'
import Button from 'core/components/Button'

export const socialLinks = [
    {
        name: 'homepage',
        icon: LinkIcon
    },
    {
        name: 'blog',
        icon: BlogIcon,
    },
    {
        name: 'rss',
        icon: RSSIcon,
    },
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

export const getSocialLinks = entity => {
    const links = socialLinks
        .map(service => ({ ...service, url: entity?.[service.name]?.url }))
        .filter(({ url }) => url)
    const homepageLink = links.find(({ name }) => name === 'homepage')
    const linksWithoutHomepage = links.filter(({ name }) => name !== 'homepage')
    const homepageLinkIsSameAsOtherLink = linksWithoutHomepage.some(
        ({ url }) => url === homepageLink?.url
    )
    return homepageLinkIsSameAsOtherLink ? linksWithoutHomepage : links
}

const SocialLinks = ({ entity }) => {
    return (
        <SocialLinks_>
            <ButtonGroup>
                {getSocialLinks(entity).map(({ name, url, icon }, index) => (
                    <LinkItem key={name} index={index} name={name} url={url} icon={icon} />
                ))}
            </ButtonGroup>
        </SocialLinks_>
    )
}

const LinkItem = ({ name, url, icon: Icon, index }) => (
    <Button_ as="a" size="small" href={url} target="_blank" rel="noreferrer">
        {Icon ? <Icon size="small" labelId={`blocks.entity.${name}_link`} /> : name}
    </Button_>
)

const Button_ = styled(Button)`
    padding: ${spacing(0.5)};
`

const SocialLinks_ = styled.div`
    /* display: flex; */
    /* gap: ${spacing()}; */
    /* align-items: center; */
`

export default SocialLinks
