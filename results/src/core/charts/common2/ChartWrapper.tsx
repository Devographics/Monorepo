import React from 'react'
import './ChartWrapper.scss'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { BAR_HEIGHT } from '../horizontalBar2/rows/RowGroup'
import { QuestionMetadata } from '@devographics/types'
import { BlockVariantDefinition } from 'core/types'

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
    return (
        <div className={classes.join(' ')} ref={parent} style={style}>
            {children}
        </div>
    )
}

export default ChartWrapper
