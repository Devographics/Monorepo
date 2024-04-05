import { UserIcon } from 'core/icons'
import './RespondentCount.scss'
import React from 'react'

export const RespondentCount = ({ count }: { count?: number }) => {
    return (
        <div className="chart-respondent-count">
            <UserIcon size={'small'} /> {count || 0}
        </div>
    )
}
