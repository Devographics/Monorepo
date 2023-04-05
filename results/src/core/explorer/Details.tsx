import React, { useState, Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { spacing, fontWeight } from 'core/theme'
import T from 'core/i18n/T'
// import Dot from './Dot'
import { CellProps } from './Cell'
import { getOptionLabel } from './labels'
import { useI18n } from 'core/i18n/i18nContext'
import Grid from './Grid'
import UnitsSelector from './UnitsSelector'
import { UnitType } from './types'
import { COUNT_UNIT } from './constants'
import round from 'lodash/round.js'
import Legend from './Legend'
import { CellData } from './helpers'
import { getValueLabel } from 'core/filters/helpers'
import { useAllFilters } from 'core/charts/hooks'
import { FilterItem } from 'core/filters/types'

export interface DetailsProps extends CellProps {
    cellData: CellData
}

const getSingleCellGrid = (options: {
    props: DetailsProps
    xKey: string
    yKey: string
    unit: UnitType
    setUnit: Dispatch<SetStateAction<UnitType>>
}) => {
    const { props, xKey, yKey, unit, setUnit } = options
    const { buckets, xKeys, yKeys, xTotals, yTotals, entities, totalCount, stateStuff } = props
    const singleCellGrid = {
        showCellCountsOverride: true,
        addModals: false,
        entities,
        stateStuff: { ...stateStuff, unit, setUnit },
        totalCount,
        xKeys: xKeys.filter(k => k === xKey),
        yKeys: yKeys.filter(k => k === yKey),
        xTotals: xTotals.filter(t => t.id === xKey),
        yTotals: yTotals.filter(t => t.id === yKey),
        buckets: buckets
            .filter(b => b.id === yKey)
            .map(b => {
                return { ...b, facetBuckets: b.facetBuckets.filter(b => b.id === xKey) }
            })
    }
    return singleCellGrid
}

const Details = (props: DetailsProps) => {
    const { getString } = useI18n()
    const allFilters = useAllFilters()
    const {
        xKeys,
        yKeys,
        entities,
        xIndex,
        yIndex,
        xTotals,
        yTotals,
        stateStuff,
        cellData,
        totalCount
    } = props
    const [unit, setUnit] = useState(stateStuff.unit)
    const xKey = xKeys[xIndex]
    const yKey = yKeys[yIndex]
    const propsOverride = getSingleCellGrid({ props, xKey, yKey, unit, setUnit })
    const { xSection, ySection, xField, yField, xAxisLabel, yAxisLabel } = stateStuff

    // const xTotal = sumBy(xTotals, 'total')
    // const yTotal = sumBy(yTotals, 'total')

    const {
        xAxisTotal,
        yAxisTotal,
        bucketPercentage,
        cellCount,
        normalizedCount,
        normalizedCountDelta,
        normalizedPercentageDelta
    } = cellData

    const xAnswerLabel = getValueLabel({
        getString,
        field: allFilters.find(f => f.id === xField) as FilterItem,
        value: xKey,
        allFilters,
        entity: entities.find(e => e.id === xKey)
    })

    const yAnswerLabel = getValueLabel({
        getString,
        field: allFilters.find(f => f.id === yField) as FilterItem,
        value: yKey,
        allFilters,
        entity: entities.find(e => e.id === yKey)
    })

    const deltaValue = unit === COUNT_UNIT ? normalizedCountDelta : normalizedPercentageDelta
    const missingOrExtra = deltaValue > 0 ? 'extra' : 'missing'

    const tProps = {
        md: true,
        html: true,
        element: 'p',
        values: {
            xAxisTotal: xAxisTotal.count,
            xAxisPercentage: xAxisTotal.percentage,
            xAxisLabel,
            xAnswerLabel,

            yAxisTotal: yAxisTotal.count,
            yAxisPercentage: yAxisTotal.percentage,
            yAxisLabel,
            yAnswerLabel,

            bucketPercentage,
            normalizedCount,
            cellCount,
            normalizedCountDelta: Math.abs(round(normalizedCountDelta, 2)),
            normalizedPercentageDelta: Math.abs(round(normalizedPercentageDelta, 2))
        }
    }
    const { dots: dots2, ...cellData2 } = cellData

    const combinedProps = { ...props, ...propsOverride }

    return (
        <Details_>
            <DetailsUnit_>
                <UnitsSelector {...combinedProps} />
            </DetailsUnit_>
            <DetailsLegend_>
                <Legend {...combinedProps} />
            </DetailsLegend_>
            <DetailsGrid_ className="details-grid">
                <Grid {...combinedProps} />
            </DetailsGrid_>

            <DetailsExplanation_>
                <DetailsExplanationHeading_>
                    <T k={`explorer.${missingOrExtra}_respondents`} />
                </DetailsExplanationHeading_>
                {unit === COUNT_UNIT ? (
                    <>
                        <T k={`explorer.${unit}_details.1`} {...tProps} />
                        <T k={`explorer.${unit}_details.2`} {...tProps} />
                        <T k={`explorer.${unit}_details.3`} {...tProps} />
                        <T k={`explorer.${unit}_details.4_${missingOrExtra}`} {...tProps} />
                    </>
                ) : (
                    <>
                        <T k={`explorer.${unit}_details.1_${missingOrExtra}`} {...tProps} />
                        <T k={`explorer.${unit}_details.2_${missingOrExtra}`} {...tProps} />
                    </>
                )}
            </DetailsExplanation_>

            {/* <pre>
                <code>{JSON.stringify(cellData2, null, 2)}</code>
            </pre>
            <pre>
                <code>{JSON.stringify(tProps.values, null, 2)}</code>
            </pre> */}
        </Details_>
    )
}

const Details_ = styled.div``

const DetailsUnit_ = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${spacing()};
`

const DetailsLegend_ = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${spacing()};
`
const DetailsGrid_ = styled.div``

const DetailsExplanation_ = styled.div`
    margin-top: ${spacing()};
    em {
        font-style: normal;
        /* font-weight: ${fontWeight('bold')}; */
        color: ${({ theme }) => theme.colors.link};
    }
`
const DetailsExplanationHeading_ = styled.h3``

// const DetailsCell_ = styled(Cell_)`
//   width: 160px;
//   height: 160px;
//   cursor: default;
// `;

export default Details
