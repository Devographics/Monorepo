import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'

import { TwitterIcon } from 'core/icons/Twitter'
import { MDNIcon, NpmIcon } from 'core/icons'
import Button from 'core/components/Button'

const links = [
    { id: 'caniuse', label: 'CanIUse', icon: TwitterIcon },
    { id: 'mdn', label: 'MDN', icon: MDNIcon },
    { id: 'homepage', label: 'Homepage', icon: TwitterIcon },
    { id: 'github', label: 'GitHub', icon: TwitterIcon },
    { id: 'npm', label: 'NPM', icon: NpmIcon }
]

const getDomain = url => {
    try {
        const { hostname } = new URL(url)
        return hostname
    } catch (error) {
        console.log(`// BlockLinks: invalid url ${url}`)
        console.log(error)
        return undefined
    }
}

const BlockLink = ({ id, label, url, icon }) => {
    const Icon = icon
    const label_ = url && (id === 'homepage' ? getDomain(url) : label)

    if (!label_) {
        return null
    }

    return (
        <Item>
            <Link as="a" href={url} title={id}>
                {label_}
                {/* <Icon labelId={`links.${id}`} /> */}
            </Link>
        </Item>
    )
}

const ResourceLink = ({ title, url }) => {
    return (
        <Item>
            <a href={url} title={title}>
                {title}
            </a>
        </Item>
    )
}

const BlockLinks = ({ entity }) => {
    return (
        <div>
            <List>
                {links.map(link => {
                    const { id } = link
                    return entity[id] ? <BlockLink key={id} {...link} {...entity[id]} /> : null
                })}
            </List>

            {entity?.resources && <BlockResources resources={entity?.resources} />}
        </div>
    )
}

const BlockResources = ({ resources }) => (
    <div>
        <ResourcesTitle_>
            <T k="charts.resources" />
        </ResourcesTitle_>
        <ul>
            {resources?.map(({ url, title }) => (
                <ResourceLink key={url} url={url} title={title} />
            ))}
        </ul>
    </div>
)

export default BlockLinks

const List = styled.ul`
    list-style-type: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    margin: 0;
    margin-bottom: ${spacing()};
`
const Item = styled.li`
    margin-right: ${spacing(0.5)};
    &:last-child {
        margin: 0;
    }
`

const Link = styled(Button)`
    font-size: ${fontSize('small')};
    padding: 2px 12px;
    border-radius: 20px;
    border: 1px solid transparent;
    background: ${props => props.theme.colors.backgroundAlt};
    background: rgba(255, 255, 255, 0.1);
`

const ResourcesTitle_ = styled.h4`
    margin-bottom: ${spacing(0.5)};
`
