import React from 'react'
import IconWrapper from './IconWrapper.js'

export const CodeIcon = props => (
    <IconWrapper {...props}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <rect
                width="14.5"
                height="14.5"
                x="4.75"
                y="4.75"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                rx="2"
            ></rect>
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8.75 10.75l2.5 2.25-2.5 2.25"
            ></path>
        </svg>
    </IconWrapper>
)
