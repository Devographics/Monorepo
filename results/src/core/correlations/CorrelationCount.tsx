import { UserIcon } from '@devographics/icons'
import { formatNumber } from 'core/charts/common2/helpers/format'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import React from 'react'

export const CorrelationCount = ({ n }: { n: number }) => {
    const respondentCount = formatNumber(n)
    return (
        <div className="correlation-item-n">
            <Tooltip
                showBorder={false}
                contents={
                    <T k="correlations.respondent_count.description" values={{ respondentCount }} />
                }
                trigger={
                    <div className="correlation-item-n-label">
                        <UserIcon size={'small'} /> <span>{respondentCount}</span>
                    </div>
                }
            />
        </div>
    )
}
