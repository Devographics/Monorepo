import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const ExternalLinkIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            version="1.1"
            x="0px"
            y="0px"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
            enableBackground="new 0 0 24 24"
            xmlSpace="preserve"
            aria-hidden="true"
        >
            <g fill="none" stroke="currentColor" fill-rule="evenodd">
                <path d="M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h5M15 3h6v6M10 14L20.2 3.8" />
            </g>
        </svg>
    </IconWrapper>
)
