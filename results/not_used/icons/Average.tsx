import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const AverageIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path fill="currentColor" d="M2 20v-8h5v8H2zM17 20V8h5v12h-5zM9.5 20V4h5v16h-5z"></path>
            <path stroke="currentColor" d="M12 1v22"></path>
        </svg>
    </IconWrapper>
)
