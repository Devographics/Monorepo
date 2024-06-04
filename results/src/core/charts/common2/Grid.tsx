import { CustomizationFiltersSeries } from 'core/filters/types'
import './Grid.scss'
import React, { Fragment, ReactNode } from 'react'
import { useFiltersLabel } from './helpers/labels'
import T from 'core/i18n/T'

export const GridWrapper = ({
    seriesCount,
    children
}: {
    seriesCount: number
    children: ReactNode
}) => {
    return (
        <div className={seriesCount > 1 ? 'chart-wrapper-grid' : 'chart-wrapper-single'}>
            {children}
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
