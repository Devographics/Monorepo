import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize } from 'core/theme'
import { useI18n } from '@devographics/react-i18n'
import Button from 'core/components/Button'

const Link = styled.a`
    display: block;
    z-index: 1000;
    position: relative;
    /* height: 24px;
    width: 24px; */
    &:last-child {
        margin-right: 0;
    }

    svg {
        height: 100%;
        width: 100%;

        circle,
        path {
            fill: ${({ theme }) => theme.colors.text};
        }
    }

    &:hover,
    &:focus {
        svg path,
        svg circle {
            fill: ${({ theme }) => theme.colors.link};
        }
    }

    .ShareSite & {
        transition: none;
        flex-grow: 1;
        text-align: center;
        padding: ${spacing()} ${spacing(0.33)};

        &:not(:last-child) {
            border-right: ${({ theme }) => theme.separationBorder};
        }

        &:hover,
        &:focus {
            background: ${({ theme }) => theme.colors.backgroundAlt};
        }

        span,
        svg {
            display: block;
            margin: 0 auto;
            height: 24px;
            width: 24px;
        }

        @media ${mq.small} {
            position: static;
        }
    }
`

const Label = styled.span`
    font-size: ${fontSize('small')};
`

const Icon = styled.span`
    display: flex;
    margin-right: ${spacing()};
`

const LinkWithLabel = styled(Button)`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    text-align: initial;
    &:hover {
        path,
        circle {
            fill: ${props => props.theme.colors.link};
            stroke: ${props => props.theme.colors.link};
        }
    }
`

const ShareLink = ({ media, showLabel, labelId, children, ...props }) => {
    const { translate } = useI18n()
    const label = translate(labelId)
    return showLabel ? (
        <LinkWithLabel
            {...props}
            as="a"
            title={label}
            aria-label={label}
            className={`ShareLink ShareLink--${media}`}
        >
            <Icon>{children}</Icon>
            <Label>{label}</Label>
        </LinkWithLabel>
    ) : (
        <Link {...props} className={`ShareLink ShareLink--${media}`}>
            {children}
        </Link>
    )
}

export default ShareLink
