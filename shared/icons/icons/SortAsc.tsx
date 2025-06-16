import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const SortAscIcon = (props: IconProps) => (
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
                d="M19.344 1.646a.5.5 0 0 0-.708 0l-3.181 3.182a.5.5 0 1 0 .707.708l2.828-2.829 2.828 2.829a.5.5 0 1 0 .707-.708zM18.99 15h.5V2h-1v13z"
            ></path>
            <path
                fill="currentColor"
                d="M21.5 17.5h-19v4h19zM15.5 10h-13v4h13zM10.5 2.5h-8v4h8z"
            ></path>
        </svg>
    </IconWrapper>
)
