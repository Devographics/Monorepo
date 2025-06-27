import React from 'react'
import { formatNumber } from './helpers/format'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { DocumentIcon } from '@devographics/icons'

export const AnswersCount = ({ count }: { count?: number }) => {
    return (
        <Tooltip
            trigger={
                <div className="chart-respondent-count">
                    <DocumentIcon size={'small'} /> {formatNumber(count || 0)}
                </div>
            }
            contents={<T k="charts.metadata.answers" values={{ value: count }} md={true} />}
            showBorder={false}
        />
    )
}
