import { UserIcon } from 'core/icons'
import './RespondentCount.scss'
import React from 'react'
import { formatNumber } from './helpers/labels'

export const RespondentCount = ({ count }: { count?: number }) => {
    return (
        <div className="chart-respondent-count">
            <UserIcon size={'small'} /> {formatNumber(count || 0)}
        </div>
    )
}
