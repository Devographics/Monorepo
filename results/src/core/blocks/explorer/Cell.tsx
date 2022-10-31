import React from 'react'
import styled from 'styled-components'
// import { mq, spacing, fontSize } from 'core/theme'
// import T from 'core/i18n/T'
// import Dot from './Dot'
import { getAllDots, getDataAttr, getDotStyle, getParameters, getCellData } from './helpers'
import { ExplorerDataFacet, Key } from './types'
import { RowProps } from './Grid'

interface CellProps extends RowProps {
    facet: ExplorerDataFacet
    xIndex: number
}

const Cell = ({ facet, xIndex, totals1 }: CellProps) => {
    const {
        bucketTotal,
        facetTotal,
        bucketPercentage,
        facetPercentageQuestion,
        facetPercentageSurvey,
        bucketCount,
        normalizedCount,
        normalizedCountDelta,
        normalizedPercentageDelta
    } = getCellData({ facet, totals1, xIndex })
    return (
        <Cell_>
            {/* <div>
              ({xIndex}, {yIndex})
          </div> */}
            {/* <div>{facet.id}</div> */}
            {/* <div>{bucket.id}</div> */}
            {/* <div>
              fCount: <strong>{facetTotal}</strong>
          </div> */}
            <div>
                count: <strong>{bucketCount}</strong>
            </div>
            <div>
                countΔ: <strong>{normalizedCountDelta}</strong>
            </div>
            <div>
                %: <strong>{bucketPercentage}%</strong>
            </div>
            <div>
                %Δ: <strong>{normalizedPercentageDelta}%</strong>
            </div>
            {/* <div>
              f%q: <strong>{facetPercentageQuestion}%</strong>
          </div> */}
            {/* <div>
              f%s: <strong>{facet.completion.percentage_survey}</strong>
          </div> */}
            {/* <div>
              bΣ: <strong>{bucketTotal}</strong>
          </div> */}
            {/* <div>
              normC: <strong>{normalizedCount}</strong>
          </div> */}
        </Cell_>
    )
}

const Cell_ = styled.div`
    background: rgba(255, 255, 255, 0.1);
    height: 100%;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgba(255, 255, 255, 0.2);
    font-size: 10px;
    z-index: 10;
    &:hover {
        background: rgba(0, 0, 0, 0.9);
        color: rgba(255, 255, 255, 0.9);
    }
`

export default Cell
