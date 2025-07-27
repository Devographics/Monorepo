import React from 'react'
import { LimitedAvailability, NewlyAvailable, WidelyAvailable } from '@devographics/icons'
import { WebFeatureStatus } from '@devographics/types'
import './BaselineIcon.scss'

export const baselineStatuses = {
    high: { icon: WidelyAvailable, id: 'widely_available' },
    low: { icon: NewlyAvailable, id: 'newly_available' },
    false: { icon: LimitedAvailability, id: 'limited_availability' }
}

export const BaselineIcon = ({ status }: { status: WebFeatureStatus['baseline'] }) => {
    const BaselineIcon = baselineStatuses[status]?.icon
    if (!BaselineIcon) {
        return null
    }
    return (
        <span className="baseline-icon">
            <BaselineIcon />
        </span>
    )
}
