import React from 'react'
import IconWrapper, { IconWrapperProps } from './IconWrapper'

export const NpmIcon = (props: IconWrapperProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="210"
            height="210"
            fill="none"
            viewBox="0 0 210 210"
        >
            <path
                fill="currentColor"
                d="M22 .722H0v7.334h6.111v1.222H11V8.056h11V.722zM3.667 6.833H1.222V1.944h4.89v4.89H4.888V3.166H3.667v3.666zm3.666 1.223V1.944h4.89v4.89H9.777v1.222H7.333zm6.111-6.112h7.334v4.89h-1.222V3.166h-1.223v3.666h-1.222V3.167H15.89v3.666h-2.445V1.944z"
            ></path>
        </svg>
    </IconWrapper>
)
