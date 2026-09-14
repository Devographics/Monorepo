import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CorrelationOptionIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="none"
            strokeLinecap="butt"
            strokeLinejoin="round"
            fill="none"
        >
            <path d="M1 1v22h22" stroke="currentColor"></path>
            <path d="M1 20.5 9 9h7l4.5-6m-4 0h4v4" stroke="currentColor"></path>
            <circle cx="19" cy="9" r="1" fill="currentColor"></circle>
            <circle cx="14" cy="6" r="1" fill="currentColor"></circle>
            <circle cx="10" cy="12" r="1" fill="currentColor"></circle>
            <circle cx="7" cy="7" r="1" fill="currentColor"></circle>
            <circle cx="4" cy="11" r="1" fill="currentColor"></circle>
            <circle cx="5" cy="20" r="1" fill="currentColor"></circle>
        </svg>
    </IconWrapper>
)
