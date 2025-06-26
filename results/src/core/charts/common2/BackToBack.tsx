import { CustomizationFiltersSeries, DataSeries } from 'core/filters/types'
import './BackToBack.scss'
import React, { Fragment, ReactNode } from 'react'
import { useFiltersLabel } from './helpers/labels'
import T from 'core/i18n/T'
import { StandardQuestionData } from '@devographics/types'
import { CommonProps } from './types'
import { HorizontalBarChartState } from '../horizontalBar2/types'
import { HorizontalBarSerie } from '../horizontalBar2/HorizontalBarSerie'
import { BlockVariantDefinition } from 'core/types'
import { getChartCurrentEdition } from '../horizontalBar2/helpers/other'

/* 

Take two series, and sort the buckets of serie 2 to be in the same order
as the buckets of serie 1.

Note: will mutate serie 2.

*/
const sortS2LikeS1 = ({
    serie1,
    serie2,
    block
}: {
    serie1: DataSeries<StandardQuestionData>
    serie2: DataSeries<StandardQuestionData>
    block: BlockVariantDefinition
}) => {
    const s1Data = getChartCurrentEdition({ serie: serie1, block })
    const s2Data = getChartCurrentEdition({ serie: serie2, block })
    const { buckets: s1Buckets } = s1Data
    const { buckets: s2Buckets } = s2Data
    const s2BucketsSorted = s2Buckets.toSorted((b1, b2) => {
        const index1 = s1Buckets.findIndex(b => b.id === b1.id)
        const index2 = s1Buckets.findIndex(b => b.id === b2.id)
        return index1 - index2
    })
    s2Data.buckets = s2BucketsSorted
}

export const BackToBack = ({
    serie1,
    serie2,
    component: component_,
    ...commonProps
}: {
    serie1: DataSeries<StandardQuestionData>
    serie2: DataSeries<StandardQuestionData>
    component?: () => React.JSX.Element
} & CommonProps<HorizontalBarChartState>) => {
    const Component = component_ ?? HorizontalBarSerie
    const { block } = commonProps
    sortS2LikeS1({ serie1, serie2, block })
    return (
        <div className="back-to-back-wrapper">
            <div className="back-to-back-serie back-to-back-serie-1 serie-reversed">
                <Component serie={serie1} serieIndex={0} {...commonProps} isReversed={true} />
            </div>
            <div className="back-to-back-axis serie-axis">
                <Component serie={serie1} serieIndex={0} {...commonProps} />
            </div>
            <div className="back-to-back-serie back-to-back-serie-2">
                <Component otherSerie={serie1} serie={serie2} serieIndex={1} {...commonProps} />
            </div>
        </div>
    )
}

export const GridItem = ({
    children,
    filters
}: {
    children: ReactNode
    filters?: CustomizationFiltersSeries
}) => {
    return (
        <div className="chart-grid-item">
            {filters && <GridItemHeading filters={filters} />}
            <div className="chart-grid-item-contents">{children}</div>
        </div>
    )
}

export const GridItemHeading = ({ filters }: { filters: CustomizationFiltersSeries }) => {
    if (filters.isDefault) {
        return (
            <div className="chart-grid-item-heading">
                <T k="charts.overall" />
            </div>
        )
    } else {
        const labelSegments = useFiltersLabel(filters)
        return (
            <div className="chart-grid-item-heading">
                {labelSegments.map((segment, i) => (
                    <Fragment key={i}>
                        <span>
                            <strong>{segment.questionLabel}</strong>{' '}
                            <span className="operator">{segment.operatorLabel}</span>{' '}
                            <strong>{segment.valueLabel}</strong>
                        </span>
                        {i + 1 < labelSegments.length && <span>, </span>}
                    </Fragment>
                ))}
            </div>
        )
    }
}
