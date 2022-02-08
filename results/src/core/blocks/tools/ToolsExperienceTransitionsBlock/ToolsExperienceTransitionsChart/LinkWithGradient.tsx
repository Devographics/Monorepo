import React, { memo } from 'react'
import { SankeyLinkDatum } from '../types'
import { getLinkPath } from './getLinkPath'

const NonMemoizedLinkWithGradient = ({ link }: {
    link: SankeyLinkDatum
}) => {
    const linkId = `${link.source.id}.${link.target.id}`
    const gradientId = `${linkId}Gradient`

    return (
        <>
            <defs>
                <linearGradient id={gradientId} spreadMethod="pad">
                    <stop offset="0%" stopColor={link.source.color} />
                    <stop offset="100%" stopColor={link.target.color} />
                </linearGradient>
            </defs>
            <path
                fill={`url(#${gradientId})`}
                d={getLinkPath(link, 1)}
            />
        </>
    )
}

export const LinkWithGradient = memo(NonMemoizedLinkWithGradient)
