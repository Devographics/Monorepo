import React from 'react'
import styled from 'styled-components'
import { LinkIcon, NpmIcon, TwitterIcon, GitHubIcon, MastodonIcon } from '@devographics/icons'
import get from 'lodash/get'

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
    }
]

export const getSocialLinks = entity =>
    socialLinks
        .map(service => ({ ...service, url: entity?.[service.name]?.url }))
        .filter(({ url }) => url)

const TickItemsLinks = ({ entity }) => (
    <>
        {getSocialLinks(entity).map(({ name, url, icon }, index) => (
            <LinkItem key={name} index={index} name={name} url={url} icon={icon} />
        ))}
    </>
)

const iconWidth = 18
const iconGap = 8

const LinkItem = ({ name, url, icon: Icon, index }) => (
    <g transform={`translate(${(iconWidth + iconGap) * index},0)`}>
        <a href={url} target="_blank" rel="noreferrer">
            <Icon size="petite" inSVG={true} labelId={`blocks.entity.${name}_link`} />
        </a>
    </g>
)

export default TickItemsLinks
