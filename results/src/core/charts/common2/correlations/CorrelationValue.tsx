import {
    CorrelationTrendIcon,
    CorrelationOptionIcon,
    CorrelationCardinalityIcon
} from '@devographics/icons'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import React from 'react'
import { CorrelationShape } from './types'
import { formatCorrelation } from './helpers'

export const CorrelationValue = ({
    value,
    direction,
    shape
}: {
    value: number
    direction: string
    shape: CorrelationShape
}) => {
    const IconComponent = direction === 'positive' ? PositiveCorrelation : NegativeCorrelation
    const shapeIcons = {
        shape1: CorrelationTrendIcon,
        shape2: CorrelationTrendIcon,
        shape3: CorrelationOptionIcon,
        shape4: CorrelationOptionIcon,
        shape5: CorrelationCardinalityIcon,
        shape6: CorrelationCardinalityIcon,
        shape7: CorrelationTrendIcon,
        shape8: CorrelationOptionIcon,
        shape9: CorrelationCardinalityIcon
    }
    const IconComponent2 = shapeIcons[shape]
    return (
        <div className="correlation-item-value">
            <IconComponent2 />
            <Tooltip
                contents={<T k={`correlations.direction.${direction}.description`} md={true} />}
                showBorder={false}
                trigger={
                    <span className="correlation-item-value-figure">
                        {formatCorrelation(value)}
                    </span>
                }
            />
            {/* <IconComponent /> */}
        </div>
    )
}

const PositiveCorrelation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 48">
        <path
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 2.243h8.485v8.485m0-8.485L3.5 20.228M13 28.243h8.485v8.485m0-8.485L3.5 46.228"
        ></path>
        <path stroke="currentColor" d="M1 24h22"></path>
    </svg>
)

const NegativeCorrelation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 48">
        <path
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 2.243h8.485v8.485m0-8.485L3.5 20.228M21.485 37.743v8.485H13m8.485 0L3.5 28.243"
        ></path>
        <path stroke="currentColor" d="M1 24h22"></path>
    </svg>
)
