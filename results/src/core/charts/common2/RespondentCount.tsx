import { UserIcon } from '@devographics/icons'
import './RespondentCount.scss'
import React from 'react'
import { formatNumber } from './helpers/format'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'

export const RespondentCount = ({ count }: { count?: number }) => {
    return (
        <Tooltip
            trigger={
                <div className="chart-respondent-count">
                    <UserIcon size={'small'} /> {formatNumber(count || 0)}
                </div>
            }
            contents={<T k="charts.metadata.respondents" values={{ value: count }} md={true} />}
            showBorder={false}
        />
    )
}
