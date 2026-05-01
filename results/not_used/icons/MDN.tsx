import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const MDNIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M9.708 2.1L3.528 22H1L7.158 2.1h2.55zM11.955 2.1V22H9.708V2.1h2.247zM22.91 2.1V22h-2.248V2.1h2.247zM20.662 2.1L14.504 22h-2.528l6.158-19.9h2.528z"
            ></path>
        </svg>
    </IconWrapper>
)
