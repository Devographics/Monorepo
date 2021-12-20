import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import T from 'core/i18n/T'

import { TwitterIcon } from 'core/icons/Twitter'
import { MDN, Npm } from 'core/icons'
import Button from 'core/components/Button'

const links = [
    { id: 'caniuse', label: 'CanIUse', icon: TwitterIcon },
    { id: 'mdn', label: 'MDN', icon: MDN },
    { id: 'homepage', label: 'Homepage', icon: TwitterIcon },
    { id: 'github', label: 'GitHub', icon: TwitterIcon },
    { id: 'npm', label: 'NPM', icon: Npm }
]

const List = styled.ul`
    list-style-type: none;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin: 0 0 0 ${spacing(0.5)};
    padding: 0;
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
    background: rgba(255,255,255,0.1);
`

const getDomain = url => {
    try {
        const { hostname } = new URL(url)
        return hostname
    } catch (error) {
        console.log(`// BlockLinks: invalid url ${url}`)
        console.log(error)
        return undefined;
    }
}

const BlockLink = ({ id, label, url, icon }) => {
    const Icon = icon
    const label_ = id === 'homepage' ? getDomain(url) : label
    
    if (!label_) {
        return null;
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

const BlockLinks = ({ entity }) => {
    return (
        <List>
            {links.map(link => {
                const { id } = link
                return entity[id] ? <BlockLink key={id} {...link} {...entity[id]} /> : null
            })}
        </List>
    )
}
export default BlockLinks
