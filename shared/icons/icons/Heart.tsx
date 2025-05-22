import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const HeartIcon = (props: IconProps) => (
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
            fill="none"
        >
            <path
                stroke="currentColor"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            ></path>
        </svg>
    </IconWrapper>
)

export default HeartIcon
