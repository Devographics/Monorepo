import React, { useState } from 'react'
import { OpinionBucket } from '@types/survey_api/opinions'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useLegends } from 'core/helpers/legends'
import { getTableData, groupDataByYears } from 'core/helpers/datatables'
import { BucketUnits, OpinionQuestionData } from '@devographics/types'
import { BlockDefinition } from 'core/types'
import OpinionStreamChart, { getChartData } from 'core/charts/opinion/OpinionStreamChart'

const OPINION_BUCKET_KEYS_ID = 'opinions'

interface OpinionBlockProps {
    block: BlockDefinition
    data: OpinionQuestionData
    defaultUnits: BucketUnits
    keys: string[]
    translateData: boolean
}

export const OpinionBlock = ({
    block,
    data,
    keys,
    defaultUnits = BucketUnits.PERCENTAGE_QUESTION,
    translateData = true
}: OpinionBlockProps) => {
    const [units, setUnits] = useState(defaultUnits)

    const chartData = getChartData(data, units)

    const [current, setCurrent] = useState<OpinionBucket['id'] | null>(null)

    const legends = useLegends({ block, namespace: block.i18nNamespace })

    const years = chartData.map(edition => edition.year)
    const allBuckets = chartData
    const tableData = groupDataByYears({ keys, data: allBuckets })

    return (
        <Block
            units={units}
            setUnits={setUnits}
            block={{
                ...block,
                bucketKeysName: OPINION_BUCKET_KEYS_ID
            }}
            legends={legends}
            data={chartData}
            legendProps={{
                onMouseEnter: ({ id }: { id: OpinionBucket['id'] }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                }
            }}
            tables={[
                getTableData({
                    data: tableData,
                    years
                })
            ]}
        >
            <ChartContainer height={300} fit={true}>
                <OpinionStreamChart
                    current={current}
                    data={data}
                    legends={legends}
                    units={units}
                    applyEmptyPatternTo={2}
                    i18nNamespace="opinions"
                    translateData={translateData}
                />
            </ChartContainer>
        </Block>
    )
}

export default OpinionBlock
