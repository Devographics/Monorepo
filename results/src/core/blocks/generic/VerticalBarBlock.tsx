import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { keys } from 'core/bucket_keys'
import BlockVariant from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart from 'core/charts/generic/VerticalBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import { useLegends } from 'core/helpers/useBucketKeys'
// import T from 'core/i18n/T'
import { FacetItem, BlockComponentProps, BlockUnits } from 'core/types'
import { getTableData } from 'core/helpers/datatables'
import sumBy from 'lodash/sumBy'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { getFieldLabel, getValueLabel } from 'core/blocks/filters/helpers'

export interface VerticalBarBlockProps extends BlockComponentProps {
    data: FacetItem
    controlledUnits: BlockUnits
    isCustom: boolean
}

export const addNoAnswerBucket = ({ buckets, completion }) => {
    const countSum = sumBy(buckets, b => b.count)
    const percentageSum = sumBy(buckets, b => b.percentage_survey)
    const noAnswerBucket = {
        id: 'no_answer',
        count: completion.total - countSum,
        percentage_question: 0,
        percentage_survey: Math.round((100 - percentageSum) * 10) / 10
    }
    return [...buckets, noAnswerBucket]
}

const getLegends = ({ theme, series, getString, currentYear }) => {
    if (series.length === 0) {
        return []
    } else {
        const showYears = series.some(s => s.year !== currentYear)

        const defaultLabel = showYears
            ? getString('filters.series.year', { values: { year: currentYear } })?.t
            : getString('filters.legend.default')?.t
        const defaultLegendItem = {
            color: theme.colors.barColors[0].color,
            gradientColors: theme.colors.barColors[0].gradient,
            id: 'default',
            label: defaultLabel,
            shortLabel: defaultLabel
        }

        const seriesLegendItems = series.map((seriesItem, seriesIndex) => {
            let labelSegments = []
            if (showYears) {
                // if at least one series is showing a different year, add year to legend
                labelSegments.push(
                    getString('filters.series.year', { values: { year: seriesItem.year } })?.t
                )
            }
            if (seriesItem.conditions.length > 0) {
                // add conditions filters to legend
                labelSegments = [
                    ...labelSegments,
                    seriesItem.conditions.map(({ field, operator, value }) => {
                        const fieldLabel = getFieldLabel({ getString, field })
                        const valueLabel = getValueLabel({
                            getString,
                            field,
                            value
                        })
                        return `${fieldLabel} = ${valueLabel}`
                    })
                ]
            }
            const label = labelSegments.join(', ')

            const legendItem = {
                color: theme.colors.barColors[seriesIndex + 1].color,
                gradientColors: theme.colors.barColors[seriesIndex + 1].gradient,
                id: `series_${seriesIndex}`,
                label,
                shortLabel: label
            }
            return legendItem
        })
        return [defaultLegendItem, ...seriesLegendItems]
    }
}

const VerticalBarBlock = ({
    block,
    data,
    keys,
    controlledUnits,
    isCustom
}: VerticalBarBlockProps) => {
    const theme = useTheme()
    const { getString } = useI18n()

    if (!data) {
        throw new Error(`VerticalBarBlock: Missing data for block ${block.id}.`)
    }
    const {
        // id,
        mode = 'relative',
        defaultUnits = 'percentage_survey',
        translateData,
        chartNamespace = block.blockNamespace ?? block.id,
        colorVariant
    } = block

    const context = usePageContext()
    const { width, currentEdition } = context
    const { year: currentYear } = currentEdition

    const [uncontrolledUnits, setUnits] = useState(defaultUnits)
    const units = controlledUnits || uncontrolledUnits

    const addNoAnswer = units === 'percentage_survey'
    const bucketKeys = keys && useLegends(block, keys, undefined, addNoAnswer)

    const { facets, completion } = data

    const buckets_ = addNoAnswer
        ? addNoAnswerBucket({ buckets: facets[0].buckets, completion })
        : facets[0].buckets
    const { total } = completion

    // contains the filters that define the series
    const [series, setSeries] = useState([])
    // how many series to display (only updated after data is loaded)
    const [seriesCount, setSeriesCount] = useState(0)
    // data to pass to chart (only updated after data is loaded)
    const [buckets, setBuckets] = useState(buckets_)

    const legends = getLegends({ theme, series, getString, currentYear })

    return (
        <BlockVariant
            tables={[
                getTableData({
                    legends: bucketKeys,
                    data: buckets,
                    valueKeys: ['percentage_survey', 'percentage_question', 'count'],
                    translateData
                })
            ]}
            units={controlledUnits ?? units}
            setUnits={setUnits}
            completion={completion}
            data={data}
            block={block}
            series={series}
            setSeries={setSeries}
            legendProps={{ layout: 'vertical' }}
            {...(legends.length > 0 ? { legends } : {})}
        >
            <DynamicDataLoader
                completion={completion}
                defaultBuckets={buckets_}
                block={block}
                series={series}
                setBuckets={setBuckets}
                setUnits={setUnits}
                setSeriesCount={setSeriesCount}
            >
                <ChartContainer fit={true}>
                    <VerticalBarChart
                        bucketKeys={bucketKeys}
                        total={total}
                        buckets={buckets}
                        i18nNamespace={chartNamespace}
                        translateData={translateData}
                        mode={mode}
                        units={controlledUnits ?? units}
                        seriesCount={seriesCount + 1}
                        viewportWidth={width}
                        colorVariant={isCustom ? 'secondary' : 'primary'}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </BlockVariant>
    )
}

VerticalBarBlock.propTypes = {
    block: PropTypes.shape({
        id: PropTypes.string.isRequired,
        dataPath: PropTypes.string.isRequired,
        bucketKeysName: PropTypes.oneOf(Object.keys(keys)),
        showDescription: PropTypes.bool,
        mode: PropTypes.oneOf(['absolute', 'relative']),
        units: PropTypes.oneOf(['percentage', 'count']),
        view: PropTypes.oneOf(['data', 'viz']),
        colorVariant: PropTypes.oneOf(['primary', 'secondary'])
    }).isRequired,
    data: PropTypes.shape({
        facets: PropTypes.arrayOf(
            PropTypes.shape({
                buckets: PropTypes.arrayOf(
                    PropTypes.shape({
                        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
                    })
                ).isRequired
            })
        ).isRequired
    }).isRequired
}

export default memo(VerticalBarBlock)
