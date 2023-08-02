import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@nivo/core'
import { useI18n } from 'core/i18n/i18nContext'
import { isPercentage } from 'core/helpers/units'
import { BucketUnits } from '@devographics/types'
import { StringTranslator } from 'core/types'
import { NO_ANSWER } from '@devographics/constants'

const getLabel = (props: any, getString: StringTranslator) => {
    const {
        id,
        legends,
        filterLegends,
        units,
        indexValue,
        data,
        i18nNamespace,
        shouldTranslate,
        facet,
        filters
    } = props
    const bucketKey =
        indexValue === NO_ANSWER
            ? { id: NO_ANSWER, label: getString('charts.no_answer').t }
            : legends && legends.find(b => b.id === indexValue)
    const { entity, label } = data
    const s = getString(`options.${i18nNamespace}.${indexValue}`)
    let extraLabel = ''

    if (facet) {
        if (units === BucketUnits.AVERAGE || units === BucketUnits.PERCENTILES) {
            const values = {} as { axis: string }
            const s = getString(`${facet.sectionId}.${facet.id}`)
            if (s?.t) {
                values.axis = s.t
            }
            extraLabel = `, ${getString('chart_units.average', { values })?.t}`
        } else {
            const [units, facetBucketId] = id.split('__')
            const labelKey =
                facetBucketId === NO_ANSWER
                    ? 'charts.no_answer'
                    : `options.${facet.id}.${facetBucketId}`
            const s2 = getString(labelKey, {}, `${facet.id}: ${facetBucketId}`)

            extraLabel = `, ${s2.t}`
        }
    } else if (filters) {
        const [units, filterIndex] = id.split('__')
        const legendItem = filterLegends[filterIndex - 1]
        extraLabel = `, ${legendItem.label}`
    }

    if (label) {
        return label
    } else if (bucketKey?.label) {
        return bucketKey.label + extraLabel
    } else if (shouldTranslate && !s.missing) {
        return s.t + extraLabel
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
            <span dangerouslySetInnerHTML={{ __html: label }} />
            :&nbsp;
            <strong>
                {data[units_]}
                {isPercentage(units) && '%'}
            </strong>
        </div>
    )
}

export default memo(BarTooltip)
