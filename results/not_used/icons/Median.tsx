import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const MedianIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M2 20v-8h5v8H2zM17 20V8h5v12h-5z"></path>
            <path stroke="currentColor" fill="none" d="M10 19.5v-15h4v15h-4z"></path>
        </svg>
    </IconWrapper>
)
