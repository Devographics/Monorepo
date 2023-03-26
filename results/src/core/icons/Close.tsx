import React from 'react'
import IconWrapper from './IconWrapper'

export const CloseIcon = props => (
    <IconWrapper {...props}>
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    </IconWrapper>
)
