import './NoData.scss'
import React from 'react'
import T from 'core/i18n/T'

export const NoData = () => (
    <div className="no-data warning">
        <T k="charts.no_data" />
    </div>
)
