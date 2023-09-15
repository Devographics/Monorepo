import React from 'react'
import IconWrapper, { IconWrapperProps } from './IconWrapper'

export const TwitchIcon = (props: IconWrapperProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
        >
            <path
                fill="currentColor"
                fillRule="evenodd"
                d="M1.977 0L.5 3.773v15.422h5.25v2.789h2.953l2.789-2.79h4.266l5.742-5.742V0H1.977zM19.53 12.469l-3.281 3.28H11l-2.79 2.79v-2.79H3.782V1.97h15.75v10.5zM16.25 5.742v5.736H14.28V5.742h1.969zm-5.25 0v5.736H9.032V5.742H11z"
                clipRule="evenodd"
            ></path>
        </svg>
    </IconWrapper>
)
