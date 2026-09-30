import React from 'react'
import { CorrelationHighlightProps, CorrelationProps } from './types'
import { getCorrelationKey } from './helpers'
import { CorrelationItemComponent } from './CorrelationItemComponent'
import { CorrelationsListHeading } from './CorrelationsListHeading'

export const CorrelationsList = (
    props: CorrelationProps & CorrelationHighlightProps & { direction: string }
) => {
    const { correlations, block, direction, activeKey, setActiveKey, enableSwap, onSwap } = props

    return (
        <div className="correlation-list">
            <CorrelationsListHeading direction={direction} />
            <div className=" correlation-items">
                {correlations.map((c, i) => (
                    <CorrelationItemComponent
                        index={i}
                        key={getCorrelationKey(c)}
                        correlation={c}
                        block={block}
                        activeKey={activeKey}
                        setActiveKey={setActiveKey}
                        enableSwap={enableSwap}
                        onSwap={onSwap}
                    />
                ))}
            </div>
        </div>
    )
}
