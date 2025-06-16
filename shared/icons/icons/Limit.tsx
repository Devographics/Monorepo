import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const LimitIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="butt"
            strokeLinejoin="round"
        >
            <path fill="currentColor" d="M21.5 6.5h-19v-3h19z"></path>
            <path d="M9.5 20.5h-7v-3h7z"></path>
            <path strokeDasharray="3 1" d="M23 15H1"></path>
            <path fill="currentColor" d="M17.5 12.5h-15v-3h15z"></path>{' '}
        </svg>
    </IconWrapper>
)

export default LimitIcon
