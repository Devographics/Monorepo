import { UserIcon } from '@devographics/icons'
import { usePageContext } from 'core/helpers/pageContext'
import './RespondentCount.scss'
import React from 'react'
import { formatNumber } from './helpers/format'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'

export const RespondentCount = ({ count }: { count?: number }) => {
    const { localeId } = usePageContext()
    return (
        <Tooltip
            trigger={
                <div className="chart-respondent-count">
                    <UserIcon size={'small'} /> {formatNumber({ value: count || 0, localeId })}
                </div>
            }
            contents={<T k="charts.metadata.respondents" values={{ value: count }} md={true} />}
            showBorder={false}
        />
    )
}
