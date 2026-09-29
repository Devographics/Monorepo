import React from 'react'
import T from 'core/i18n/T'
import { NegativeCorrelation, PositiveCorrelation } from './CorrelationValue'

export const CorrelationsListHeading = (props: { direction: string }) => {
    const { direction } = props

    const IconComponent = direction === 'positive' ? PositiveCorrelation : NegativeCorrelation
    return (
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
            {/* <div className="correlation-list-heading-image">
                <IconComponent />
            </div> */}
        </div>
    )
}
