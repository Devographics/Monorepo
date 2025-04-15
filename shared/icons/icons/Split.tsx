import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const SplitIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 5H4V8H0z"></path>
            <path d="M9 5H12V8H9z"></path>
            <path d="M18 5H24V8H18z"></path>
            <path d="M0 11H4V14H0z"></path>
            <path d="M9 11H14V14H9z"></path>
            <path d="M18 11H21V14H18z"></path>
            <path d="M0 17H3V20H0z"></path>
            <path d="M9 17H13V20H9z"></path>
            <path d="M18 17H23V20H18z"></path>
        </svg>
    </IconWrapper>
)
