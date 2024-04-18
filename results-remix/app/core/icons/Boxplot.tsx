import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const Boxplot = (props: IconProps) => (
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
            <path d="M3 3H7V5H3z"></path>
            <path d="M7 11H11V13H7z"></path>
            <path d="M3 19H7V21H3z"></path>
            <path d="M13 3H17V5H13z"></path>
            <path d="M17 11H21V13H17z"></path>
            <path d="M10 19H14V21H10z"></path>
            <path strokeWidth="2" d="M6 2H14V6H6z"></path>
            <path strokeWidth="2" d="M10 10H18V14H10z"></path>
            <path strokeWidth="2" d="M6 18H11V22H6z"></path>
            <circle cx="18" cy="4" r="1.5"></circle>
            <circle cx="22" cy="12" r="1.5"></circle>
            <circle cx="15" cy="20" r="1.5"></circle>
            <circle cx="2" cy="4" r="1.5"></circle>
            <circle cx="6" cy="12" r="1.5"></circle>
            <circle cx="2" cy="20" r="1.5"></circle>
        </svg>
    </IconWrapper>
)
