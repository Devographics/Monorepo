import './Column.scss'
import { usePageContext } from 'core/helpers/pageContext'
import React from 'react'
import {
    BasicPointData,
    EmptyColumnProps,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../types'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { Highlight } from 'core/components/Highlight'
import { ResponseEditionData } from '@devographics/types'

type ColumnWrapperProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = EmptyColumnProps<PointData> & {
    chartValues: VerticalBarChartValues
    rowMetadata?: JSX.Element
    children?: JSX.Element
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
    // the column's edition, when the column is an edition (used for highlighting)
    edition?: ResponseEditionData
}

export const ColumnWrapper = <SerieData, PointData extends BasicPointData, ChartStateType>(
    props: ColumnWrapperProps<SerieData, PointData, ChartStateType>
) => {
    const {
        serie,
        edition,
        columnId,
        columnIndex,
        children,
        rowMetadata,
        viewDefinition,
        chartValues,
        chartState
    } = props
    const { highlighted } = chartState
    const { formatColumnId, formatValue } = viewDefinition
    const { localeId } = usePageContext()
    const { columnAverages } = chartValues
    /*

    We add +1 because grid columns are 1-indexed, and +1 again to
    account for left axis column, and +1 again to account for spacer columns.

    */
    const style = {
        '--columnStart': columnIndex + 2,
        '--columnEnd': columnIndex + 3
    }

    const columnAverage = columnAverages?.find(c => c.columnId === columnId)?.average

    const columnLabel = <span> {formatColumnId({ columnId, columnIndex, chartValues })}</span>
    return (
        <Highlight blockId={edition ? serie.name : undefined} editionId={edition?.editionId}>
            <div
                className={`chart-column chart-column-${
                    highlighted === null ? 'highlightInactive' : 'highlightActive'
                }`}
                style={style}
            >
                {rowMetadata && <div className="chart-column-top">{rowMetadata}</div>}
                <div className="chart-column-content">
                    {children && <div className="chart-bar">{children}</div>}
                </div>
                <div className="chart-column-bottom chart-axis">
                    <div className="chart-column-label">
                        {columnAverage ? (
                            <Tooltip
                                trigger={columnLabel}
                                contents={
                                    <T
                                        k="charts.average_value"
                                        values={{
                                            value: formatValue({
                                                value: columnAverage,
                                                chartState,
                                                localeId
                                            })
                                        }}
                                    />
                                }
                            />
                        ) : (
                            columnLabel
                        )}
                    </div>
                </div>
            </div>
        </Highlight>
    )
}
