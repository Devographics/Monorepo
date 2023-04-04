import React from 'react'
import styled from 'styled-components'
import { mq, spacing, fontSize, fontWeight } from 'core/theme'
// import T from 'core/i18n/T'
// import Dot from './Dot'
import { CellData, getCellData } from './helpers'
import { ExplorerDataFacet, Key } from './types'
import { RowProps } from './InnerGrid'
import CellDots from './CellDots'
import { getQuestionLabel, getOptionLabel } from './labels'
import { useI18n } from 'core/i18n/i18nContext'
import { COUNT_UNIT, CELL_BG, CELL_VPADDING, CELL_HPADDING } from './constants'
import ModalTrigger from 'core/components/ModalTrigger'
import Details from './Details'
import { FacetBucket } from '@devographics/types'

export interface CellProps extends RowProps {
    facetBucket: FacetBucket
    xIndex: number
    yIndex: number
}

// const getCellBgColor = ({ dots }) => {
//   if (dots.length > 0) {
//     return CELL_BG;
//   } else {
//     return 'rgba(255, 255, 255, 0.02)';
//   }
// };

const Cell = (props: CellProps) => {
    // const { getString } = useI18n();

    const {
        addModals = true,
        facetBucket,
        xIndex,
        yIndex,
        xTotals,
        yTotals,
        totalCount,
        stateStuff
    } = props
    const { respondentsPerDot, percentsPerDot, dotsPerLine, unit } = stateStuff
    const cellData = getCellData({
        facetBucket,
        xIndex,
        xTotals,
        yIndex,
        yTotals,
        respondentsPerDot,
        percentsPerDot,
        dotsPerLine,
        unit,
        totalCount
    })
    return addModals ? (
        <ModalTrigger
            size="s"
            trigger={
                <div>
                    <InnerCell {...props} cellData={cellData} />
                </div>
            }
        >
            <Details {...props} cellData={cellData} />
        </ModalTrigger>
    ) : (
        <InnerCell {...props} cellData={cellData} />
    )
}

export interface InnerCellProps extends CellProps {
    cellData: CellData
}

const InnerCell = (props: InnerCellProps) => {
    const { showCellCountsOverride, stateStuff, cellData } = props
    const { unit } = stateStuff
    const showCellCounts = showCellCountsOverride || stateStuff.showCellCounts
    return (
        <Cell_>
            <CellDots {...props} cellData={cellData} />
            {showCellCounts && (
                <CellCount_>
                    <CellCountInner_>
                        {unit === COUNT_UNIT
                            ? cellData.cellCount
                            : `${Math.floor(cellData.bucketPercentage)}%`}
                    </CellCountInner_>
                </CellCount_>
            )}
        </Cell_>
    )
}

const Cell_ = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  padding: ${CELL_VPADDING}px ${CELL_HPADDING}px;
  background: ${CELL_BG};
  cursor: pointer;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  .details-grid & {
    cursor: default;
    &:hover {
      background ${CELL_BG};
    }
  }
`

const CellCount_ = styled.div`
    position: absolute;
    top: 8px;
    bottom: 8px;
    left: 8px;
    right: 8px;
    display: grid;
    place-items: end end;
    /* display: flex; */
    /* align-items: flex-end; */
    /* justify-contents: flex-end; */
`

const CellCountInner_ = styled.div`
    opacity: 0.2;
    line-height: 1;
    /* font-weight: ${fontWeight('bold')}; */
    @media ${mq.small} {
        font-size: 1rem;
    }
    @media ${mq.mediumLarge} {
        font-size: 1.2rem;
    }
`

export default Cell
