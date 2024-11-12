import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const BlueskyIcon = (props: IconProps) => {
    return (
        <IconWrapper {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="round"
            >
                <path d="M5.976 3.578c2.439 1.79 5.061 5.419 6.024 7.366.963-1.947 3.585-5.576 6.024-7.366 1.759-1.29 4.61-2.29 4.61.89 0 .634-.373 5.333-.591 6.096-.76 2.652-3.526 3.329-5.986 2.92 4.3.715 5.395 3.086 3.032 5.456-4.488 4.503-6.45-1.13-6.953-2.572-.092-.265-.135-.389-.136-.283 0-.106-.044.018-.136.283-.503 1.443-2.465 7.075-6.953 2.572-2.363-2.37-1.269-4.741 3.032-5.457-2.46.41-5.227-.267-5.986-2.919-.218-.763-.59-5.462-.59-6.097 0-3.179 2.85-2.18 4.61-.889"></path>
            </svg>
        </IconWrapper>
    )
}
