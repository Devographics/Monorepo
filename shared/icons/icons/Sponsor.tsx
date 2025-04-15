import React from 'react'
import IconWrapper, { IconWrapperProps } from './IconWrapper'

export const SponsorIcon = (props: Partial<IconWrapperProps>) => (
    <IconWrapper {...props}>
        <>
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
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>{' '}
        </>
    </IconWrapper>
)
