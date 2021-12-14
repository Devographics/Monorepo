import React from 'react'
import IconWrapper from './IconWrapper'

export const DataIcon = props => (
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
            <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
        </svg>
    </IconWrapper>
)
