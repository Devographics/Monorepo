import React, { memo, useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import VerticalBarChart from 'core/charts/generic/VerticalBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import range from 'lodash/range'
import { getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_COMBINED } from 'core/blocks/filters/constants'

const groupBy = 10

const getLabel = n => `${n * groupBy}-${(n + 1) * groupBy}%`

const KnowledgeScoreBlock = ({ block, data: questionData }) => {
    const data = questionData.responses.currentEdition

    if (!data) {
        throw new Error(
            `KnowledgeScoreBlock: Missing data for block ${block.id}, page data is undefined`
        )
    }
    const { id, mode = 'relative', units: defaultUnits = 'percentageSurvey', i18nNamespace } = block

    const context = usePageContext()
    const { width } = context

    const [units, setUnits] = useState(defaultUnits)

    const { total, completion } = data

    const bucketKeys = range(0, 100 / groupBy).map(n => ({
        id: getLabel(n),
        shortLabel: getLabel(n)
    }))
    let buckets = data.buckets

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_COMBINED] }
    })

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
