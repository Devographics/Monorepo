import React from 'react'
import './ChartWrapper.scss'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { BAR_HEIGHT } from '../horizontalBar2/rows/RowGroup'
import T from 'core/i18n/T'
import ChartNestedToggle from './ChartNestedToggle'
import { ChartStateWithNestedToggle, CommonProps } from './types'

export const ChartWrapper = (
    props: CommonProps<ChartStateWithNestedToggle> & {
        children: JSX.Element
        className?: string
    }
) => {
    const { block, children, className = '' } = props
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    const style = {
        '--barHeight': `${BAR_HEIGHT}px`
    }
    const classes = ['chart-wrapper', `chart-${block?.id}`, `chart-${block?.template}`, className]
    const { descriptionId } = block
    const hasNestedData = block?.queryOptions?.addNestedBuckets

    return (
        <div className="chart-wrapper-outer">
            <div className="chart-wrapper-heading">
                {descriptionId && (
                    <div className="chart-description">
                        <T k={descriptionId} />
                    </div>
                )}
                {hasNestedData && <ChartNestedToggle {...props} />}
            </div>
            <div className={classes.join(' ')} ref={parent} style={style}>
                {children}
            </div>
        </div>
    )
}

export default ChartWrapper
