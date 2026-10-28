import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

export const NewIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="26"
            fill="none"
            viewBox="0 0 44 26"
        >
            <path
                fill="currentColor"
                d="M28 8v8h-2V8zm4 2v6h-2v-6zm-4 8v-2h2v2zm4 0v-2h2v2zm2-10h2v8h-2zM24 18h-6V8h6v2h-4v2h4v2h-4v2h4zM14 14h-2v-2h2V8h2v10h-2zm-4-2v6H8V8h2v2h2v2z"
            ></path>
            <path
                stroke="currentColor"
                d="M39 10v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h25.5"
            ></path>
            <path
                fill="currentColor"
                d="m40.5 3.5 1.805.902L43.5 5l-1.195.598L40.5 6.5l-.902 1.805L39 9.5l-.598-1.195L37.5 6.5l-3-1.5 1.195-.598L37.5 3.5l.902-1.805L39 .5zm-1.904.797-.1.199-.2.1-.808.404.809.404.199.1.1.2.404.808.404-.809.1-.199.2-.1.808-.404-.809-.404-.199-.1-.1-.2L39 3.489z"
            ></path>
        </svg>
    </IconWrapper>
)
