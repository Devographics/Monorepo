import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CloseIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg stroke="currentColor" viewBox="0 0 24 24" className="icon-close">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </IconWrapper>
)
