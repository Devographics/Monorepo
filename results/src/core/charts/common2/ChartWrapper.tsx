import React from 'react'
import './ChartWrapper.scss'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { BAR_HEIGHT } from '../horizontalBar2/rows/RowGroup'
import { QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'
import T from 'core/i18n/T'

export const ChartWrapper = ({
    block,
    children,
    className = '',
    question
}: {
    block: BlockVariantDefinition
    children: JSX.Element
    className?: string
    question?: QuestionMetadata
}) => {
    const [parent, enableAnimations] = useAutoAnimate(/* optional config */)
    const style = {
        '--barHeight': `${BAR_HEIGHT}px`
    }
    const classes = ['chart-wrapper', `chart-${block?.id}`, className]
    const { descriptionId } = block
    return (
        <div className="chart-wrapper-outer">
            {descriptionId && (
                <div className="chart-description">
                    <T k={descriptionId} />
                </div>
            )}
            <div className={classes.join(' ')} ref={parent} style={style}>
                {children}
            </div>
        </div>
    )
}

export default ChartWrapper
