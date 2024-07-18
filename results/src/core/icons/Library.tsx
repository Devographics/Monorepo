import React from 'react'
import IconWrapper, { IconProps } from './IconWrapper'

// export const LibraryIcon = (props: IconProps) => (
//     <IconWrapper {...props}>
//         <svg
//             xmlns="http://www.w3.org/2000/svg"
//             width={32}
//             height={32}
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="butt"
//             strokeLinejoin="round"
//         >
//             <path d="M13 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
//             <path d="M13 3v6h6" />
//         </svg>
//     </IconWrapper>
// )

export const LibraryIcon = (props: IconProps) => (
    <IconWrapper {...props}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={32}
            height={32}
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M15 11a1 1 0 01-1 1h-4a1 1 0 010-2h4a1 1 0 011 1zm-5-5h4a1 1 0 010 2h-4a1 1 0 010-2zm8 0V4c1.103 0 2 .897 2 2h-2zm-2 12c0 1.103-.897 2-2 2v-2a2 2 0 00-2-2H8V6a2 2 0 012-2h6v14zm-4 2H6c-1.103 0-2-.897-2-2h7a1 1 0 011 1v1zm6-18h-8a4 4 0 00-4 4v10H3a1 1 0 00-1 1v1a4 4 0 004 4h8a4 4 0 004-4V8h3a1 1 0 001-1V6a4 4 0 00-4-4z"
                clipRule="evenodd"
            ></path>
        </svg>
    </IconWrapper>
)
