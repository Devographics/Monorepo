import './InsufficientDataIndicator.scss'
import React from 'react'
import T from 'core/i18n/T'
import Tooltip from 'core/components/Tooltip'

export const InsufficientDataIndicator = () => {
    return (
        <Tooltip
            trigger={
                <span className="chart-insufficient-data">
                    <T k="charts.insufficient_data" />
                </span>
            }
            contents={<T k="charts.insufficient_data.description" values={{ value: 10 }} />}
        />
    )
}
