import React from 'react'
import styled from 'styled-components'
import { mq, spacing } from 'core/theme'

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

    &:hover, &:focus {
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

        &:hover, &:focus {
            background: ${({ theme }) => theme.colors.backgroundAlt};
        }

        span, svg {
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

const ShareLink = ({ media, ...props }) => (
    <Link {...props} className={`ShareLink ShareLink--${media}`} />
)

export default ShareLink
