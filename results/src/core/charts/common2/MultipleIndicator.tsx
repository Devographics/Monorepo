import './MultipleIndicator.scss'
import React from 'react'
import { MultipleIcon } from '@devographics/icons'
import T from 'core/i18n/T'
import Tooltip from 'core/components/Tooltip'

export const MultipleIndicator = ({ showLabel = false }: { showLabel?: boolean }) => {
    return (
        <Tooltip
            trigger={
                <div className="chart-multiple">
                    {showLabel && <T k="blocks.multiple" />}
                    <MultipleIcon className="chart-row-multiple-icon" size="petite" />
                </div>
            }
            contents={<T k="charts.multiple_data.description" />}
            showBorder={false}
        />
    )
}
