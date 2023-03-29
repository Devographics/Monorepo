import React, { useState } from 'react'
import { BlockContext } from 'core/blocks/types'
import { OpinionBucket } from '@types/survey_api/opinions'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
// @ts-ignore
import StreamChart from 'core/charts/generic/StreamChart'
// @ts-ignore
import { useLegends } from 'core/helpers/legends'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData, groupDataByYears } from 'core/helpers/datatables'
import { QuestionData } from '@devographics/types'
import { BlockDefinition } from 'core/types'

const OPINION_BUCKET_KEYS_ID = 'opinions'

interface OpinionBlockProps {
    block: BlockDefinition
    data: QuestionData
    units: 'percentageSurvey' | 'percentageQuestion' | 'count'
    keys: string[]
    translateData: boolean
}

export const OpinionBlock = ({
    block,
    data: blockData,
    keys,
    units: defaultUnits = 'percentageQuestion',
    translateData = true
}: OpinionBlockProps) => {
    const chartData = blockData?.responses?.allEditions
    if (!chartData) {
        throw Error(`No data found for block ${block.id}`)
    }

    const { id } = block
    const [units, setUnits] = useState(defaultUnits)

    const [current, setCurrent] = useState<OpinionBucket['id'] | null>(null)

    const { translate } = useI18n()

    const bucketKeys = useLegends({ block, namespace: 'opinions' })

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
            legends={bucketKeys}
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
                <StreamChart
                    colorScale={bucketKeys.map(key => key.color)}
                    current={current}
                    // for opinions only having one year of data, we duplicate the year's data
                    // to be able to use the stream chart.
                    data={allBuckets.length === 1 ? [allBuckets[0], allBuckets[0]] : allBuckets}
                    bucketKeys={bucketKeys}
                    keys={bucketKeys.map(key => key.id)}
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
