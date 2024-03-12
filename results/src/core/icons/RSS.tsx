import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const RSSIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.667 22a3.667 3.667 0 100-7.333 3.667 3.667 0 000 7.333z"></path>
            <path d="M0 11a11 11 0 0111 11h3.667A14.667 14.667 0 000 7.333V11z"></path>
            <path d="M0 3.667A18.333 18.333 0 0118.333 22H22A22 22 0 000 0v3.667z"></path>
        </svg>
    </IconWrapper>
)
