import { YearCompletion } from '@devographics/types'
import React from 'react'

export const Metadata = ({ completion }: { completion: YearCompletion }) => {
    const { count, percentageSurvey, total } = completion
    return (
        <div className="chart-metadata">
            {count}/{total} ({percentageSurvey}%)
        </div>
    )
}

export default Metadata
