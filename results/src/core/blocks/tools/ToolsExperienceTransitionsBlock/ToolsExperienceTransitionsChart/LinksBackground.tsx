import React, { memo } from 'react'
import styled from 'styled-components'
import { darken } from 'polished'
import { SankeyLinkDatum } from '../types'
import { getLinkId } from './getLinkId'
import { getLinkPath } from './getLinkPath'

const NonMemoizedLinksBackground = ({ links }: {
    links: SankeyLinkDatum[]
}) => (
    <>
        {links.map(link => (
            <LinkShape
                key={getLinkId(link)}
                d={getLinkPath(link, 1)}
            />
        ))}
    </>
)

const LinkShape = styled.path`
    fill: ${({ theme }) => darken(.03, theme.colors.background)};
`

export const LinksBackground = memo(NonMemoizedLinksBackground)