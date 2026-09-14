import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CorrelationTrendIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeLinecap="butt"
            strokeLinejoin="round"
            fill="none"
        >
            <path d="M1 1v22h22"></path>
            <path d="m1 10 5.75-3 8.75 2.5 5-5m-4 0h4v4M1 18.5l5.75-3L15.5 18l5-5m-4 0h4v4"></path>
        </svg>
    </IconWrapper>
)
