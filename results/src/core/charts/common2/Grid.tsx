import { CustomizationFiltersSeries, DataSeries } from 'core/filters/types'
import './Grid.scss'
import React, { Fragment, ReactNode } from 'react'
import { useFiltersLabel } from './helpers/labels'
import T from 'core/i18n/T'
import { SortProperty } from '@devographics/types'
import Tooltip from 'core/components/Tooltip'
import { getChartCurrentEdition, getSerieMetadata } from '../horizontalBar2/helpers/other'
import { BlockVariantDefinition } from 'core/types'

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

export const GridItem = <SerieType extends DataSeries<any>>({
    children,
    filters,
    currentSort,
    serie,
    block
}: {
    children: ReactNode
    filters?: CustomizationFiltersSeries
    currentSort?: SortProperty
    serie: SerieType
    block: BlockVariantDefinition
}) => {
    return (
        <div className={`chart-grid-item chart-sort-${currentSort}`}>
            {filters && (
                <GridItemHeading<SerieType> filters={filters} serie={serie} block={block} />
            )}
            <div className="chart-grid-item-contents">{children}</div>
        </div>
    )
}

export const GridItemHeading = <SerieType extends DataSeries<any>>({
    filters,
    block,
    serie
}: {
    filters: CustomizationFiltersSeries
    block: BlockVariantDefinition
    serie: SerieType
}) => {
    // if we can, figure out how many respondents are in this particular data serie
    const currentEdition = serie && block && getChartCurrentEdition({ serie, block })
    const serieCount = currentEdition?.completion?.count
    if (filters.isDefault) {
        return (
            <div className="chart-grid-item-heading">
                <T k="charts.overall" />
            </div>
        )
    } else {
        const labelSegments = useFiltersLabel(filters)
        const headingContents = labelSegments.map((segment, i) => {
            const { questionKey, questionLabel, operatorKey, operatorLabel, valueLabels } = segment
            return (
                <Fragment key={i}>
                    <span>
                        <strong data-key={questionKey}>{questionLabel}</strong>{' '}
                        <span data-key={operatorKey} className="operator">
                            {operatorLabel}
                        </span>{' '}
                        {valueLabels.map(({ valueKey, valueLabel }, index) => (
                            <span key={valueKey}>
                                {index > 0 && ', '}
                                <strong data-key={valueKey}>{valueLabel}</strong>
                            </span>
                        ))}
                    </span>
                    {i + 1 < labelSegments.length && <span>, </span>}
                </Fragment>
            )
        })

        return (
            <Tooltip
                trigger={
                    <div className="chart-grid-item-heading">
                        <span className="chart-grid-item-heading-label">{headingContents}</span>
                        {serieCount && (
                            <span className="chart-grid-item-heading-count">{serieCount}</span>
                        )}
                    </div>
                }
                contents={headingContents}
                showBorder={false}
            />
        )
    }
}
