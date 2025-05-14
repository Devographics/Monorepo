import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const PositivityIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
        >
            <path
                d="M19.875 6.27C20.575 6.668 21.005 7.413 21 8.218V15.502C21 16.311 20.557 17.057 19.842 17.45L13.092 21.72C12.7574 21.9037 12.3818 22.0001 12 22.0001C11.6182 22.0001 11.2426 21.9037 10.908 21.72L4.158 17.45C3.80817 17.2588 3.51612 16.9772 3.31241 16.6345C3.1087 16.2918 3.0008 15.9007 3 15.502V8.217C3 7.408 3.443 6.663 4.158 6.27L10.908 2.29C11.2525 2.10004 11.6396 2.00041 12.033 2.00041C12.4264 2.00041 12.8135 2.10004 13.158 2.29L19.908 6.27H19.875Z"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M9 12H15" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9V15" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </IconWrapper>
)
