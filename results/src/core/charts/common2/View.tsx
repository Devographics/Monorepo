import React from 'react'
import { CommonProps } from './types'
import { getViewComponent } from '../horizontalBar2/helpers/views'

export const View = (props: CommonProps) => {
    const { chartState } = props
    const ViewComponent = getViewComponent(chartState.view)
    return (
        <div className="chart-view">
            <ViewComponent {...props} />
        </div>
    )
}

export default View
