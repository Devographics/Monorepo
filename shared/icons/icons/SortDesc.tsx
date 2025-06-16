import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const SortDescIcon = (props: IconProps) => (
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
            <path
                fill="currentColor"
                d="M18.646 22.354a.5.5 0 0 0 .708 0l3.182-3.182a.5.5 0 1 0-.708-.707L19 21.293l-2.828-2.828a.5.5 0 1 0-.708.707zM19 9h-.5v13h1V9z"
            ></path>
            <path
                fill="currentColor"
                stroke="currentColor"
                d="M21.5 6.5h-19v-4h19zM15.5 14h-13v-4h13zM10.5 21.5h-8v-4h8z"
            ></path>{' '}
        </svg>
    </IconWrapper>
)
