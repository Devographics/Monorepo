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

const groupBy = 10

const getLabel = (n) => `${n * groupBy}-${(n + 1) * groupBy}%`

const getChartData = ({ data }) => {
    const buckets = data.facets[0].buckets
    return range(0, 100 / groupBy).map((n) => {
        const selectedBuckets = buckets.filter(
            (b) => b.id >= n * groupBy && b.id < (n + 1) * groupBy
        )
        return {
            id: getLabel(n),
            count: sumBy(selectedBuckets, 'count'),
            percentage_survey: Math.round(100 * sumBy(selectedBuckets, 'percentage_survey')) / 100,
            percentage_question: Math.round(100 * sumBy(selectedBuckets, 'percentage_question')) / 100,
        }
    })
}

const KnowledgeScoreBlock = ({ block, data }) => {
    if (!data) {
        throw new Error(
            `KnowledgeScoreBlock: Missing data for block ${block.id}, page data is undefined`
        )
    }
    const {
        id,
        mode = 'relative',
        units: defaultUnits = 'percentage_survey',
        i18nNamespace,
    } = block

    const context = usePageContext()
    const { width } = context

    const [units, setUnits] = useState(defaultUnits)
    

    const { total, completion } = data

    const bucketKeys = range(0, 100 / groupBy).map((n) => ({
        id: getLabel(n),
        shortLabel: getLabel(n),
    }))

    const groupedBuckets = getChartData({ data })

    return (
        <Block
            tables={[getTableData({
                legends: bucketKeys,
                data: groupedBuckets,
            })]}
            units={units}
            setUnits={setUnits}
            completion={completion}
            data={data}
            block={block}
        >
            <ChartContainer fit={true}>
                <VerticalBarChart
                    bucketKeys={bucketKeys}
                    total={total}
                    buckets={groupedBuckets}
                    i18nNamespace={i18nNamespace || id}
                    translateData={false}
                    mode={mode}
                    units={units}
                    viewportWidth={width}
                />
            </ChartContainer>
        </Block>
    )
}

export default memo(KnowledgeScoreBlock)
