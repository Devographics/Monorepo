import React, { memo } from 'react'
import { SankeyLinkDatum } from '../types'
import { getLinkId } from './getLinkId'
import { getLinkPath } from './getLinkPath'

const NonMemoizedLinksBackground = ({ links }: {
    links: SankeyLinkDatum[]
}) => (
    <>
        {links.map(link => (
            <path
                key={getLinkId(link)}
                fill="#1a181a"
                d={getLinkPath(link, 1)}
            />
        ))}
    </>
)

export const LinksBackground = memo(NonMemoizedLinksBackground)