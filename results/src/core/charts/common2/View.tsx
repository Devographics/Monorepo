import React from 'react'
import { CommonProps } from './types'
import { getViewComponent } from '../horizontalBar2/helpers/views'
import { ROW_HEIGHT } from './Row'

export const View = (props: CommonProps) => {
    const { chartState } = props
    const ViewComponent = getViewComponent(chartState.view)
    const style = {
        '--rowHeight': ROW_HEIGHT
    }
    return (
        <div className="chart-view" style={style}>
            <ViewComponent {...props} />
        </div>
    )
}

export default View
