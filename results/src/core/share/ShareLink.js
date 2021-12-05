import React from 'react'
import styled, { keyframes } from 'styled-components'
import { mq, spacing } from 'core/theme'

const transform = (size, translate) => keyframes`
    0% {
        opacity: 0;
        transform: ${size === "small" ? "translate(-50%, -50%)" : "translate(0, 0)"};
    }
    100% {
        opacity: 1;
        ${
            size === "small"
            ? `transform: translateX(${translate.x}) translateY(${translate.y});`
            : `transform: translateX(${translate.x});`
        }
`;

const Link = styled.a`
    display: block;
    flex-shrink: 0;
    z-index: 1000;
    position: relative;
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

    .ShareBlock & {
        height: 24px;
        width: 24px;

        opacity: 0;

        display: none;
    }
    .ShareBlock._is-visible & {
        pointer-events: auto;
        display block;

        &.ShareLink--twitter {
            @media ${mq.small} {
                animation: ${transform("small", {x: "-50%", y: "-275%"})} 500ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
            @media ${mq.mediumLarge} {
                animation: ${transform("mediumLarge", {x: "20%"})} 500ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
        }
        &.ShareLink--facebook {
            @media ${mq.small} {
                animation: ${transform("small", {x: "-200%", y: "-200%"})} 500ms 100ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
            @media ${mq.mediumLarge} {
                animation: ${transform("mediumLarge", {x: "60%"})} 500ms 100ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
        }
        &.ShareLink--linkedin {
            @media ${mq.small} {
                animation: ${transform("small", {x: "-275%", y: "-50%"})} 500ms 200ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
            @media ${mq.mediumLarge} {
                animation: ${transform("mediumLarge", {x: "130%"})} 500ms 200ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
        }
        &.ShareLink--email {
            @media ${mq.small} {
                animation: ${transform("small", {x: "-200%", y: "100%"})} 500ms 300ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
            @media ${mq.mediumLarge} {
                animation: ${transform("mediumLarge", {x: "200%"})} 500ms 300ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
        }
        &.ShareLink--image {
            @media ${mq.small} {
                animation: ${transform("small", {x: "-50%", y: "175%"})} 500ms 300ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
            @media ${mq.mediumLarge} {
                animation: ${transform("mediumLarge", {x: "270%"})} 500ms 300ms cubic-bezier(0.87, -0.41, 0.19, 1.44) forwards;
            }
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

const ShareLink = ({ media, ...props }) => (
    <Link {...props} className={`ShareLink ShareLink--${media}`} />
)

export default ShareLink
