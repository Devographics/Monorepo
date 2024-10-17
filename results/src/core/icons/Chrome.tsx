import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const ChromeIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            className="icon-chrome"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            strokeWidth="1.5"
            color="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                fill="currentColor"
                d="M0 12c0-2.184.586-4.237 1.608-6.042l5.147 8.962A6.002 6.002 0 0012 18c.67 0 1.27-.108 1.912-.31l-3.576 6.197C4.496 23.078 0 18.061 0 12zm17.114 3.075A5.76 5.76 0 0018 12c0-1.79-.788-3.398-2.03-4.5h7.158c.563 1.387.872 2.91.872 4.5 0 6.628-5.372 11.958-12 12l5.114-8.925zM22.397 6H12a5.97 5.97 0 00-5.883 4.814L2.541 4.617A11.966 11.966 0 0112 0a12 12 0 0110.397 6zM7.875 12a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0z"
            ></path>
        </svg>
    </IconWrapper>
)
