import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const SafariIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            className="icon-safari"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeWidth="1.5"
            color="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M12.877 12.877l-1.754-1.754-3.342 5.096 5.096-3.342zM12 .375C5.578.375.375 5.578.375 12S5.578 23.625 12 23.625 23.625 18.422 23.625 12 18.422.375 12 .375zm1.42 13.045l-8.25 5.41 5.414-8.246L18.83 5.17l-5.41 8.25z"
            ></path>
        </svg>
    </IconWrapper>
)
