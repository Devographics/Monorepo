import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const NpmIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path d="M23 9H1v7.334h6.111v1.222H12v-1.222h11V9zM4.667 15.111H2.222v-4.889h4.89v4.89H5.888v-3.668H4.667v3.667zm3.666 1.223v-6.112h4.89v4.89h-2.446v1.222H8.333zm6.111-6.112h7.334v4.89h-1.222v-3.668h-1.223v3.666h-1.222v-3.665H16.89v3.666h-2.445l-.001-4.889z"></path>
        </svg>
    </IconWrapper>
)
