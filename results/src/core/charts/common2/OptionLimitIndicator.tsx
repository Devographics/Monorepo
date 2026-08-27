import './MultipleIndicator.scss'
import React from 'react'
import { MultipleIcon } from '@devographics/icons'
import T from 'core/i18n/T'
import Tooltip from 'core/components/Tooltip'

export const OptionLimitIndicator = ({
    showLabel = false,
    limit
}: {
    showLabel?: boolean
    limit: number
}) => {
    return (
        <Tooltip
            trigger={
                <div className="chart-limit">
                    {showLabel && <T k="blocks.option_limit" />}
                    <div className="chart-limit-number">
                        <div>{limit}</div>
                    </div>
                </div>
            }
            contents={<T k="charts.option_limit.description" values={{ limit }} />}
            showBorder={false}
        />
    )
}
