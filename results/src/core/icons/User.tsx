import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const UserIcon = (props: IconProps) => {
    return (
        <IconWrapper {...props}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="round"
            >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        </IconWrapper>
    )
}
