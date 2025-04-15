import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const MultipleIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="butt"
            strokeLinejoin="round"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.333 7.029v.306A3.333 3.333 0 1 1 6.357 4.29M8.333 17.029v.306a3.333 3.333 0 1 1-1.976-3.046"
            ></path>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.333 4.669 5 8.005l-1-1M8.333 14.669 5 18.005l-1-1"
            ></path>
            <path strokeLinecap="round" d="M11.5 7.335h10M11.5 18h10"></path>
        </svg>
    </IconWrapper>
)
