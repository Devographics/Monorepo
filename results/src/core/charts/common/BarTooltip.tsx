import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@nivo/core'
import { useI18n } from '@devographics/react-i18n'
import { isPercentage } from 'core/helpers/units'
import { BucketUnits } from '@devographics/types'
import { BlockLegend, StringTranslator } from 'core/types'
import { INSUFFICIENT_DATA, NO_ANSWER } from '@devographics/constants'
import { getItemLabel } from 'core/helpers/labels'
import { CustomizationFiltersSeries, FacetItem } from 'core/filters/types'
import T from 'core/i18n/T'
import { usePageContext } from 'core/helpers/pageContext'

const getExtraLabel = (options: {
    id: string
    legends?: BlockLegend[]
    filterLegends?: any
    units: BucketUnits
    indexValue: number
    i18nNamespaces: any
    facet?: FacetItem
    filters?: CustomizationFiltersSeries[]
    getString: StringTranslator
}) => {
    const {
        id,
        legends,
        i18nNamespaces,
        filterLegends,
        units,
        indexValue,
        facet,
        filters,
        getString
    } = options

    // const bucketKey =
    //     indexValue === NO_ANSWER
    //         ? { id: NO_ANSWER, label: getString('charts.no_answer').t }
    //         : legends && legends.find(b => b.id === indexValue)

    // console.log(bucketKey)

    let extraLabel: string | undefined = ''

    if (facet) {
        if (units === BucketUnits.AVERAGE || units === BucketUnits.PERCENTILES) {
            const values = {} as { axis: string }
            const s = getString(`${facet.sectionId}.${facet.id}`)
            if (s?.t) {
                values.axis = s.t
            }
            extraLabel = getString('chart_units.average', { values })?.t
        } else {
            const i18nNamespace = i18nNamespaces[facet.id] || facet.id
            const [units, facetBucketId] = id.split('__')
            const labelKey =
                facetBucketId === NO_ANSWER
                    ? 'charts.no_answer'
                    : `options.${i18nNamespace}.${facetBucketId}`
            const s2 = getString(labelKey, {}, `${i18nNamespace}: ${facetBucketId}`)

            extraLabel = s2.t
        }
    } else if (filters) {
        const [units, filterIndex] = id.split('__')
        const legendItem = filterLegends[Number(filterIndex) - 1]
        extraLabel = legendItem?.label
    }

    return extraLabel
}

/**
 * This tooltip can be used for general bar charts:
 * - HorizontalBarChart
 * - VerticalBarChart
 */
const BarTooltip = props => {
    const {
        id,
        i18nNamespace,
        entity,
        units,
        indexValue,
        data,
        legends,
        filterLegends,
        facet,
        filters,
        labelFormatter
    } = props
    const { getString } = useI18n()
    const context = usePageContext()
    const { i18nNamespaces } = context

    const extraLabel = id.includes(INSUFFICIENT_DATA)
        ? getString('charts.insufficient_data')?.t
        : getExtraLabel({
              id,
              legends,
              filterLegends,
              i18nNamespaces,
              units,
              indexValue,
              facet,
              filters,
              getString
          })

    const { key, label } = getItemLabel({
        getString,
        i18nNamespace,
        id: indexValue,
        entity,
        extraLabel
    })

    const nivoTheme = useTheme()

    const { isFreeformData } = data
    const units_ = id
    const countUnits = units_.replace(units, BucketUnits.COUNT)
    const count = data[countUnits]
    const showCount = units !== BucketUnits.COUNT

    return (
        <div style={{ ...nivoTheme.tooltip.container, maxWidth: 300 }}>
            <span dangerouslySetInnerHTML={{ __html: label }} />
            {isFreeformData && (
                <span>
                    {' '}
                    <T k="charts.freeform_data" />
                </span>
            )}
            :&nbsp;
            <strong>{labelFormatter(data[units_])}</strong>
            {showCount && (
                <>
                    {' '}
                    <T k="charts.facet_respondents" values={{ count }} />
                </>
            )}
        </div>
    )
}

export default memo(BarTooltip)
