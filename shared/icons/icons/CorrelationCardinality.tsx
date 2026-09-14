import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CorrelationCardinalityIcon = (props: IconProps) => (
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
            <path stroke="currentColor" d="M1 1v22h22"></path>
            <path stroke="currentColor" d="M1 20.5 9 9h7l4.5-6m-4 0h4v4"></path>
            <circle cx="4" cy="21" r="1" fill="currentColor"></circle>
            <circle cx="8" cy="21" r="1" fill="currentColor"></circle>
            <circle cx="8" cy="17" r="1" fill="currentColor"></circle>
            <circle cx="12" cy="21" r="1" fill="currentColor"></circle>
            <circle cx="12" cy="17" r="1" fill="currentColor"></circle>
            <circle cx="12" cy="13" r="1" fill="currentColor"></circle>
            <circle cx="16" cy="21" r="1" fill="currentColor"></circle>
            <circle cx="16" cy="17" r="1" fill="currentColor"></circle>
            <circle cx="16" cy="13" r="1" fill="currentColor"></circle>
            <circle cx="20" cy="21" r="1" fill="currentColor"></circle>
            <circle cx="20" cy="17" r="1" fill="currentColor"></circle>
            <circle cx="20" cy="13" r="1" fill="currentColor"></circle>
            <circle cx="20" cy="9" r="1" fill="currentColor"></circle>
        </svg>
    </IconWrapper>
)
