import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const StackedIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 5H7V8H0z"></path>
            <path d="M9 5H15V8H9z"></path>
            <path d="M17 5H24V8H17z"></path>
            <path d="M0 11H4V14H0z"></path>
            <path d="M6 11H17V14H6z"></path>
            <path d="M19 11H24V14H19z"></path>
            <path d="M0 17H3V20H0z"></path>
            <path d="M5 17H14V20H5z"></path>
            <path d="M16 17H24V20H16z"></path>
        </svg>
    </IconWrapper>
)
