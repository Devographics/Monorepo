import './Column.scss'
import React from 'react'
import { ColumnComponentProps } from '../types'

export const ColumnWrapper = (
    props: ColumnComponentProps & { rowMetadata?: JSX.Element; children: JSX.Element }
) => {
    const { chartState, columnIndex, children, rowMetadata, edition } = props

    /*

    We add +1 because grid columns are 1-indexed, and +1 again to
    account for left axis column, and +1 again to account for spacer columns.

    */
    const style = {
        '--columnStart': columnIndex + 3,
        '--columnEnd': columnIndex + 4
    }
    return (
        <div className="chart-column" style={style}>
            {rowMetadata && <div className="chart-column-top">{rowMetadata}</div>}

            <div className="chart-column-content">
                {/* {ticks && <Gridlines ticks={ticks} />} */}
                <div className="chart-bar">{children}</div>
            </div>

            <div className="chart-column-bottom">
                <div className="chart-column-year">{edition.year}</div>
            </div>
        </div>
    )
}
