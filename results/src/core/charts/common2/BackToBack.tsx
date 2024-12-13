import { CustomizationFiltersSeries, DataSeries } from 'core/filters/types'
import './BackToBack.scss'
import React, { Fragment, ReactNode } from 'react'
import { useFiltersLabel } from './helpers/labels'
import T from 'core/i18n/T'
import { StandardQuestionData } from '@devographics/types'
import { CommonProps } from './types'
import { HorizontalBarChartState } from '../horizontalBar2/types'
import { HorizontalBarSerie } from '../horizontalBar2/HorizontalBarSerie'

export const BackToBack = ({
    serie1,
    serie2,
    component: component_,
    ...commonProps
}: {
    serie1: DataSeries<StandardQuestionData>
    serie2: DataSeries<StandardQuestionData>
    component?: React.ReactNode
} & CommonProps<HorizontalBarChartState>) => {
    const Component = component_ ?? HorizontalBarSerie
    console.log(commonProps)
    return (
        <div className="back-to-back-wrapper">
            <div className="back-to-back-serie back-to-back-serie-1 serie-reversed">
                <Component serie={serie1} serieIndex={0} {...commonProps} isReversed={true} />
            </div>
            <div className="back-to-back-axis serie-axis">
                <Component serie={serie1} serieIndex={0} {...commonProps} />
            </div>
            <div className="back-to-back-serie back-to-back-serie-2">
                <Component serie={serie2} serieIndex={1} {...commonProps} />
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
