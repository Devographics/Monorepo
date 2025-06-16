import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const CutoffIcon = (props: IconProps) => (
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
            <path fill="currentColor" d="M9.5 6.5h-7v-4h7zM21.5 6.5h-7v-4h7z"></path>
            <path d="M9.5 21.5h-7v-4h7z"></path>
            <path strokeDasharray="3 1" d="M12 1v22"></path>
            <path fill="currentColor" d="M9.5 14.5h-7v-5h7zM17.5 14.5h-3v-5h3z"></path>
        </svg>
    </IconWrapper>
)

export default CutoffIcon
