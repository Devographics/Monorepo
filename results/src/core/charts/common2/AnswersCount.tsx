import React from 'react'
import { usePageContext } from 'core/helpers/pageContext'
import { formatNumber } from './helpers/format'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import { DocumentIcon } from '@devographics/icons'

export const AnswersCount = ({ count }: { count?: number }) => {
    const { localeId } = usePageContext()
    return (
        <Tooltip
            trigger={
                <div className="chart-respondent-count">
                    <DocumentIcon size={'small'} /> {formatNumber({ value: count || 0, localeId })}
                </div>
            }
            contents={<T k="charts.metadata.answers" values={{ value: count }} md={true} />}
            showBorder={false}
        />
    )
}
