import { UserIcon } from '@devographics/icons'
import Tooltip from 'core/components/Tooltip'
import T from 'core/i18n/T'
import React from 'react'
import { formatNumber } from '../helpers/format'

export const CorrelationSubheading = ({
    questionName,
    optionLabel,
    n,
    index
}: {
    questionName: string
    optionLabel?: string
    n: number
    index: number
}) => {
    const respondentCount = formatNumber(n)
    const showIndex = false
    return (
        <div className="correlation-item-subheading">
            <h4 className="correlation-item-breadcrumbs">
                <span>
                    <span className="correlation-item-index">{index + 1}.</span> {questionName}
                </span>

                {optionLabel && (
                    <>
                        {' '}
                        &gt; <span>{optionLabel}</span>
                    </>
                )}
            </h4>
            <Tooltip
                contents={
                    <T k="correlations.respondent_count.description" values={{ respondentCount }} />
                }
                trigger={
                    <div className="correlation-item-n">
                        <UserIcon size={'small'} /> <span>{respondentCount}</span>
                    </div>
                }
            />
        </div>
    )
}
