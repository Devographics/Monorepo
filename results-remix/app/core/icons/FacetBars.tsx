import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const FacetBars = (props: IconProps) => (
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
            <path d="M0 5H9V8H0z"></path>
            <path d="M11 5H24V8H11z"></path>
            <path d="M19 11H24V14H19z"></path>
            <path d="M0 11H5V14H0z"></path>
            <path d="M7 11H17V14H7z"></path>
            <path d="M0 17H13V20H0z"></path>
            <path d="M15 17H24V20H15z"></path>
        </svg>
    </IconWrapper>
)
