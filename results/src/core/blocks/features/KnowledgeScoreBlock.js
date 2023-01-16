import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { keys } from 'core/bucket_keys'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart from 'core/charts/generic/VerticalBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import range from 'lodash/range'
import sumBy from 'lodash/sumBy'
import T from 'core/i18n/T'
import { getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { getLegends } from 'core/blocks/filters/helpers'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import { initFilters } from 'core/blocks/filters/helpers'

const groupBy = 10

const getLabel = n => `${n * groupBy}-${(n + 1) * groupBy}%`

const getChartData = (buckets) => {
    return range(0, 100 / groupBy).map(n => {
        const selectedBuckets = buckets.filter(b => b.id >= n * groupBy && b.id < (n + 1) * groupBy)
        return {
            id: getLabel(n),
            count: sumBy(selectedBuckets, 'count'),
            percentage_survey: Math.round(100 * sumBy(selectedBuckets, 'percentage_survey')) / 100,
            percentage_question:
                Math.round(100 * sumBy(selectedBuckets, 'percentage_question')) / 100
        }
    })
}

const KnowledgeScoreBlock = ({ block, data }) => {
    const theme = useTheme()
    const { getString } = useI18n()
    if (!data) {
        throw new Error(
            `KnowledgeScoreBlock: Missing data for block ${block.id}, page data is undefined`
        )
    }
    const {
        id,
        mode = 'relative',
        units: defaultUnits = 'percentage_survey',
        i18nNamespace
    } = block

    const context = usePageContext()
    const { width, currentEdition } = context
    const { year: currentYear } = currentEdition

    const [units, setUnits] = useState(defaultUnits)

    const { total, completion } = data

    const bucketKeys = range(0, 100 / groupBy).map(n => ({
        id: getLabel(n),
        shortLabel: getLabel(n)
    }))

    let buckets = data.facets[0].buckets
    buckets = getChartData(buckets)

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(initFilters)

    const legends = getLegends({ theme, chartFilters, getString, currentYear })

    return (
        <Block
            tables={[
                getTableData({
                    legends: bucketKeys,
                    data: buckets
                })
            ]}
            units={units}
            setUnits={setUnits}
            completion={completion}
            data={data}
            block={block}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
            {...(legends.length > 0 ? { legends } : {})}
        >
            <DynamicDataLoader
                completion={completion}
                defaultBuckets={buckets}
                block={block}
                chartFilters={chartFilters}
                setUnits={setUnits}
                processBuckets={getChartData}
            >
                <ChartContainer fit={true}>
                    <VerticalBarChart
                        bucketKeys={bucketKeys}
                        total={total}
                        buckets={buckets}
                        i18nNamespace={i18nNamespace || id}
                        translateData={false}
                        mode={mode}
                        units={units}
                        viewportWidth={width}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default memo(KnowledgeScoreBlock)
