import React from 'react'
import styled from 'styled-components'

export const AwardIcon2 = () => (
    <Icon>
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g className="bg">
                <path d="M41.9478 246.75L151.5 57L261.052 246.75H41.9478Z" />
                <path d="M160.049 233.95C180.592 226.091 198.362 217.362 207.928 208.005C217.421 198.72 226.162 181.32 233.98 161.156C246.52 128.815 273.661 105.914 303.772 97.2523C333.815 88.6099 366.532 94.1883 390.755 118.411C437.381 165.037 415.299 245.398 353.128 271.113C330.613 280.426 310.9 290.5 300.626 300.545C290.422 310.523 280.347 329.864 271.097 352.012C245.059 414.354 164.433 436.774 117.667 390.008C93.5093 365.85 87.8714 333.209 96.4212 303.282C104.989 273.29 127.761 246.301 160.049 233.95Z" />
                <path d="M349.396 193.071L476.72 320.395L349.396 447.72L222.071 320.395L349.396 193.071Z" />
            </g>
            <g className="fg">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    ?
                </text>
            </g>
        </svg>
    </Icon>
)

const Icon = styled.div`
    path {
        stroke: ${({ theme }) => theme.colors.background};
    }
`
export default AwardIcon2
