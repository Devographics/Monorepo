import './FreeformIndicator.scss'
import React from 'react'
import { FreeformIcon } from 'core/icons'
import T from 'core/i18n/T'
import Tooltip from 'core/components/Tooltip'

export const FreeformIndicator = ({ showLabel = false }: { showLabel?: boolean }) => {
    return (
        <Tooltip
            trigger={
                <div className="chart-freeform">
                    {showLabel && <T k="blocks.freeform" />}
                    <FreeformIcon className="chart-row-freeform-icon" size="petite" />
                </div>
            }
            contents={<T k="charts.freeform_data.description" />}
        />
    )
}
