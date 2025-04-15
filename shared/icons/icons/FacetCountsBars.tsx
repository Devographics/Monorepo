import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const FacetCountsBars = (props: IconProps) => (
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
            <path d="M0 5H7V8H0z"></path>
            <path d="M9 5H14V8H9z"></path>
            <path d="M0 11H5V14H0z"></path>
            <path d="M17 11H24V14H17z"></path>
            <path d="M7 11H15V14H7z"></path>
            <path d="M0 17H12V20H0z"></path>
            <path d="M14 17H19V20H14z"></path>
        </svg>
    </IconWrapper>
)
