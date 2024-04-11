import './Metadata.scss'
import { YearCompletion } from '@devographics/types'
import T from 'core/i18n/T'
import React from 'react'

export const Metadata = ({ completion }: { completion: YearCompletion }) => {
    if (!completion) {
        return <div>No completion data</div>
    }
    const { count, percentageSurvey, total } = completion

    return (
        <div className="chart-metadata">
            <T
                k="chart_units.respondents"
                values={{ count, percentage: percentageSurvey, total }}
                html={true}
                md={true}
            />
        </div>
    )
}

export default Metadata
