import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@nivo/core'
import { useI18n } from 'core/i18n/i18nContext'
import { useEntities } from 'core/entities/entitiesContext'

/**
 * This tooltip can be used for general bar charts:
 * - HorizontalBarChart
 * - VerticalBarChart
 */
const BarTooltip = ({ units, indexValue, data, i18nNamespace, shouldTranslate }) => {
    const { getName } = useEntities()
    const { translate } = useI18n()
    const label = shouldTranslate
        ? translate(`options.${i18nNamespace}.${indexValue}`)
        : getName(indexValue)
    const nivoTheme = useTheme()

    return (
        <div style={{ ...nivoTheme.tooltip.container, maxWidth: 300 }}>
            {label}:&nbsp;
            <strong>{data[units]}%</strong>
            &nbsp;({data.count})
        </div>
    )
}

BarTooltip.propTypes = {
    indexValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    data: PropTypes.shape({
        percentage_survey: PropTypes.number,
        percentage_question: PropTypes.number,
        count: PropTypes.number.isRequired,
    }).isRequired,
    units: PropTypes.string.isRequired,
    i18nNamespace: PropTypes.string.isRequired,
    shouldTranslate: PropTypes.bool.isRequired,
}

export default memo(BarTooltip)
