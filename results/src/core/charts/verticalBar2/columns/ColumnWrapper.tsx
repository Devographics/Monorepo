import './Column.scss'
import React from 'react'
import { BasicPointData, EmptyColumnProps, VerticalBarViewDefinition } from '../types'

type ColumnWrapperProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = EmptyColumnProps<PointData> & {
    rowMetadata?: JSX.Element
    children?: JSX.Element
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export const ColumnWrapper = <SerieData, PointData extends BasicPointData, ChartStateType>(
    props: ColumnWrapperProps<SerieData, PointData, ChartStateType>
) => {
    const { columnId, columnIndex, children, rowMetadata, viewDefinition } = props
    const { formatColumn } = viewDefinition
    /*

    We add +1 because grid columns are 1-indexed, and +1 again to
    account for left axis column, and +1 again to account for spacer columns.

    */
    const style = {
        '--columnStart': columnIndex + 2,
        '--columnEnd': columnIndex + 3
    }
    return (
        <div className="chart-column" style={style}>
            {rowMetadata && <div className="chart-column-top">{rowMetadata}</div>}

            {children && (
                <div className="chart-column-content">
                    {/* {ticks && <Gridlines ticks={ticks} />} */}
                    <div className="chart-bar">{children}</div>
                </div>
            )}

            <div className="chart-column-bottom">
                <div className="chart-column-id">{formatColumn({ columnId, columnIndex })}</div>
            </div>
        </div>
    )
}
