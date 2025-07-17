import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const ExperimentalIcon = (props: IconProps) => (
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
            stroke="none"
        >
            <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M21.585 18.57A2.2 2.2 0 0 1 19.7 21.9H4.3a2.2 2.2 0 0 1-1.885-3.33L8.7 10.9V2.1h6.6v8.8zM6.5 2.1h11"
            ></path>
            <circle cx="12" cy="14" r="2" fill="currentColor"></circle>
            <circle cx="13" cy="19" r="1" fill="currentColor"></circle>
            <circle cx="9.5" cy="17.5" r="1.5" fill="currentColor"></circle>
        </svg>
    </IconWrapper>
)

export default ExperimentalIcon
