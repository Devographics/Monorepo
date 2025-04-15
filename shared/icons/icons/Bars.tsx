import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const Bars = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="round"
        >
            <path d="M0 5H17V8H0z"></path>
            <path d="M0 11H24V14H0z"></path>
            <path d="M0 17H13V20H0z"></path>
        </svg>
    </IconWrapper>
)
