import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
// import Dot from './Dot'
import { getDots, getDataAttr, getParameters } from './helpers'
import { ExplorerDataFacet, Key } from './types'

interface DotsProps {
    facets: ExplorerDataFacet[]
    keys1: Key[]
    keys2: Key[]
}

const Dots = ({ facets, keys1, keys2 }: DotsProps) => {
    console.log(facets)
    const dots = getDots({ facets, keys1, keys2 })
    console.log(dots)
    console.log(getParameters({ keys1, keys2 }))
    return (
        <Dots_>
            {dots.map((dot, i) => (
                <Dot_
                    {...getDataAttr(dot)}
                    key={i}
                    style={{ left: `${dot.x}px`, top: `${dot.y}px` }}
                />
            ))}
        </Dots_>
    )
}

const Dots_ = styled.div``

const Dot_ = styled.div`
    border-radius: 100%;
    background: rgba(255, 255, 255, 0.5);
    color: white;
    color: rgba(255, 255, 255, 0);
    height: 6px;
    width: 6px;
    margin-right: 2px;
    margin-bottom: 2px;
    position: absolute;
    z-index: 5;
`

export default Dots
