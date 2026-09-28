import React from 'react'
import { CorrelationProps } from './types'
import { CorrelationItemComponent } from './CorrelationItemComponent'

export const CorrelationsList = (props: CorrelationProps) => {
    const { correlations, block } = props

    return (
        <div className="correlation-list correlation-items">
            {correlations.map((c, i) => (
                <CorrelationItemComponent index={i} key={i} correlation={c} block={block} />
            ))}
        </div>
    )
}
