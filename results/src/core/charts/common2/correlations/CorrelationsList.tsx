import React from 'react'
import { CorrelationProps } from './types'
import { CorrelationItemComponent } from './CorrelationItemComponent'
import T from 'core/i18n/T'
import { NegativeCorrelation, PositiveCorrelation } from './CorrelationValue'

export const CorrelationsList = (props: CorrelationProps & { direction: string }) => {
    const { correlations, block, direction } = props

    const IconComponent = direction === 'positive' ? PositiveCorrelation : NegativeCorrelation
    return (
        <div className="correlation-list">
            <div className="correlation-list-heading">
                <div className="correlation-list-heading-contents">
                    <h3>
                        <T k={`correlations.direction.${direction}.title`} />
                    </h3>
                    <p>
                        <T
                            k={`correlations.direction.${direction}.description`}
                            html={true}
                            md={true}
                        />
                    </p>
                </div>
                <div className="correlation-list-heading-image">
                    <IconComponent />
                </div>
            </div>
            <div className=" correlation-items">
                {correlations.map((c, i) => (
                    <CorrelationItemComponent index={i} key={i} correlation={c} block={block} />
                ))}
            </div>
        </div>
    )
}
