import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CardinalityIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="none"
            strokeLinecap="butt"
            strokeLinejoin="round"
        >
            <path
                fill="currentColor"
                stroke="currentColor"
                d="M6.5 6.5h-5v-5h5zM6.5 14.5h-5v-5h5z"
            ></path>
            <path strokeWidth="2" stroke="currentColor" d="M6.5 22.5h-5v-5h5z" fill="none"></path>
            <path stroke="currentColor" strokeWidth="2" d="M10 4h13M10 12h6M10 20h10"></path>
        </svg>
    </IconWrapper>
)
