import React from 'react'
import styled, { css } from 'styled-components'
import { mq } from 'core/theme'
import {
    AXIS_PADDING,
    AXIS_BG,
    AXIS_BG2,
    GRID_GAP,
    DOT_GAP,
    DOT_RADIUS,
    CELL_VPADDING
} from './constants'
import { CommonProps, Key, AxisType, Total } from './types'
import { getOptionLabel } from './labels'
import { useI18n } from 'core/i18n/i18nContext'
import maxBy from 'lodash/maxBy.js'
import { CellData, getCellData } from './helpers'
import { UserIcon, PercentIcon } from 'core/icons'
import Tooltip from 'core/components/Tooltip'
import { Bucket, FacetBucket } from '@devographics/types'

interface AxisProps extends CommonProps {
    axis: AxisType
    keys: Key[]
}

const getAxisStyle = ({
    buckets,
    id,
    xTotals,
    yTotals,
    totalCount,
    stateStuff
}: {
    buckets: Bucket[]
    id: string
    xTotals: Total[]
    yTotals: Total[]
    totalCount: number
    stateStuff: any
}) => {
    const { respondentsPerDot, percentsPerDot, dotsPerLine, unit } = stateStuff
    const currentRowCells = buckets.find(b => b.id === id)?.facetBuckets as FacetBucket[]
    const currentRowCellsData = currentRowCells.map((facetBucket, xIndex) =>
        getCellData({
            facetBucket,
            xTotals,
            xIndex,
            yTotals,
            yIndex: 0,
            respondentsPerDot,
            percentsPerDot,
            dotsPerLine,
            totalCount,
            unit
        })
    )
    const biggestCell = maxBy(currentRowCellsData, c => c.dotsCount) as CellData
    const { dotsCount, rowCount } = biggestCell
    const dynamicHeight = DOT_RADIUS * rowCount + DOT_GAP * (rowCount - 1) + CELL_VPADDING * 2
    return { flexBasis: `${Math.max(100, dynamicHeight)}px` }
}

const Axis = (props: AxisProps) => {
    const { axis, keys } = props
    return (
        <Axis_ axis={axis} count={keys.length}>
            {keys.map((key: string, index) => (
                <AxisItem key={key} index={index} id={key} {...props} />
            ))}
        </Axis_>
    )
}

interface AxisItemProps extends AxisProps {
    buckets: Bucket[]
    id: string
    index: number
    xTotals: Total[]
    yTotals: Total[]
}

const AxisItem = (props: AxisItemProps) => {
    const { id, axis, index, entities, stateStuff } = props
    const { useMobileLayout } = stateStuff
    const totals = props[`${axis}Totals`]
    const { getString } = useI18n()
    const sectionId = stateStuff[`${axis}Section`]
    const questionId = stateStuff[`${axis}Field`]

    const total = totals.find(t => t.id === id) as Total
    const { count: totalCount, percentage: totalPercentage } = total

    const answerLabel = getOptionLabel({
        getString,
        questionId,
        optionId: id,
        isShort: useMobileLayout
    })

    return (
        <AxisItem_ axis={axis} style={axis === 'y' ? getAxisStyle(props) : {}}>
            <Tooltip
                trigger={
                    <AxisItemInner_>
                        <AxisLabel_ dangerouslySetInnerHTML={{ __html: answerLabel }} />
                        <AxisTotals_>
                            <AxisTotal_>
                                <UserIcon
                                    enableHover={false}
                                    enableTooltip={false}
                                    labelId="explorer.axis_total"
                                    values={{ totalCount }}
                                />
                                <span>{totalCount}</span>
                            </AxisTotal_>
                            <AxisTotal_>
                                <PercentIcon
                                    enableHover={false}
                                    enableTooltip={false}
                                    labelId="explorer.axis_percentage"
                                    values={{ totalPercentage }}
                                />
                                <span>{totalPercentage}</span>
                            </AxisTotal_>
                        </AxisTotals_>
                    </AxisItemInner_>
                }
                contents={<span>TODO</span>}
                // contents={
                //   axis === 'y' ? (
                //     <span>
                //       Out of all **{}** respondents who completed question “{xAxisLabel}”, **{totalCount}** survey respondents picked “
                //       {answerLabel}” for “{yAxisLabel}”{/* <T k="explorer.axis_total" values={{ totalCount }} /> */}
                //     </span>
                //   ) : (
                //     <span>
                //       Out of all **{}** respondents who completed question “{yAxisLabel}”, **{totalCount}** survey respondents picked “
                //       {answerLabel}” for “{xAxisLabel}”{/* <T k="explorer.axis_total" values={{ totalCount }} /> */}
                //     </span>
                //   )
                // }
            />
        </AxisItem_>
    )
}

const Axis_ = styled.div<{ axis: AxisType; count: number }>`
    /* position: absolute; */
    font-size: 12px;

    ${({ axis, count }) =>
        axis === 'y'
            ? css`
                  display: flex;
                  flex-direction: column;
                  gap: ${GRID_GAP}px;
              `
            : css`
                  display: grid;
                  grid-auto-columns: minmax(0, 1fr);
                  grid-auto-flow: column;
                  grid-column-gap: ${GRID_GAP}px;
                  position: sticky;
                  top: 0;
                  z-index: 10;
                  backdrop-filter: blur(2px);
                  .details-grid & {
                      position: static;
                  }
              `}
`

const AxisItem_ = styled.div<{ axis: AxisType }>`
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    background: ${AXIS_BG};
    display: flex;
    padding: ${AXIS_PADDING}px;
    justify-content: center;
    text-align: center;
    align-items: center;
    cursor: default;
    .details-grid & {
        background: ${AXIS_BG2};
    }
`

const AxisItemInner_ = styled.div``

const AxisLabel_ = styled.div``

const AxisTotals_ = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    @media ${mq.small} {
        gap: 5px;
        flex-direction: column;
    }
`

const AxisTotal_ = styled.div`
    color: ${({ theme }) => theme.colors.textAlt};
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    .icon-wrapper {
        height: 16px;
        width: 16px;
        svg {
            color: ${({ theme }) => theme.colors.textAlt};
            height: 100%;
            width: 100%;
        }
    }
`

export default Axis
