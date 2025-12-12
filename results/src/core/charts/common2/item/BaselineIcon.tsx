import React from 'react'
import { LimitedAvailability, NewlyAvailable, WidelyAvailable } from '@devographics/icons'
import { WebFeatureStatus } from '@devographics/types'
import './BaselineIcon.scss'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'

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
        <Tooltip
            trigger={
                <span className="baseline-icon">
                    <BaselineIcon />
                </span>
            }
            contents={
                <>
                    <T k="baseline.baseline" /> <T k={`baseline.support.${status}`} />
                </>
            }
        />
    )
}
