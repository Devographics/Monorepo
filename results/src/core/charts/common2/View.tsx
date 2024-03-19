import React from 'react'
import { getViewComponent } from '../horizontalBar2/helpers/other'
import { CommonProps } from './types'

export const View = (props: CommonProps) => {
    const { chartState } = props
    const ViewComponent = getViewComponent({ chartState })
    return (
        <div className="chart-view">
            <ViewComponent {...props} />
        </div>
    )
}

export default View
