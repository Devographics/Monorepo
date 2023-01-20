import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@nivo/core'
import { useI18n } from 'core/i18n/i18nContext'
import { isPercentage } from 'core/helpers/units'

const getLabel = (props, getString) => {
    const { id, bucketKeys, units, indexValue, data, i18nNamespace, shouldTranslate, facet } = props
    const bucketKey = bucketKeys && bucketKeys.find(b => b.id === indexValue)
    const { entity, label } = data
    const s = getString(`options.${i18nNamespace}.${indexValue}`)
    let facetLabel = ''
    if (facet) {
        const [units, facetBucketId] = id.split('__')
        const s2 = getString(`options.${facet}.${facetBucketId}`, {}, `${facet}: ${facetBucketId}`)
        facetLabel = `, ${s2.t}`
    }

    if (label) {
        return label
    } else if (bucketKey?.label) {
        return bucketKey.label + facetLabel
    } else if (shouldTranslate && !s.missing) {
        return s.t + facetLabel
    } else if (entity) {
        return entity.name
    } else {
        return indexValue
    }
}

/**
 * This tooltip can be used for general bar charts:
 * - HorizontalBarChart
 * - VerticalBarChart
 */
const BarTooltip = props => {
    const { id, bucketKeys, units, indexValue, data, i18nNamespace, shouldTranslate, facet } = props
    const { getString } = useI18n()
    const label = getLabel(props, getString)

    const nivoTheme = useTheme()

    const units_ = id
    return (
        <div style={{ ...nivoTheme.tooltip.container, maxWidth: 300 }}>
            {label}:&nbsp;
            <strong>
                {data[units_]}
                {isPercentage(units) && '%'}
            </strong>
        </div>
    )
}

export default memo(BarTooltip)
