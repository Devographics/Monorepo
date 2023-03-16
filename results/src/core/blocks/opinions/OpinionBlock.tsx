import React, { useMemo, useState } from 'react'
import { BlockContext } from 'core/blocks/types'
import { OpinionBucket, OpinionAllYearsData } from 'core/types/survey_api/opinions'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
// @ts-ignore
import StreamChart from 'core/charts/generic/StreamChart'
// @ts-ignore
import { useBucketKeys, useLegends } from 'core/helpers/useBucketKeys'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { TableBucketItem, getTableData, groupDataByYears } from 'core/helpers/datatables'
import { BlockUnits, ResultsByYear } from 'core/types'
import { isPercentage } from 'core/helpers/units'
import { EditionData } from '@devographics/types'
import { useOptions } from 'core/helpers/options'

const OPINION_BUCKET_KEYS_ID = 'opinions'

interface OpinionBlockProps {
    block: BlockContext<'opinionTemplate', 'OpinionBlock'>
    data: EditionData[]
    units: 'percentage_survey' | 'percentage_question' | 'count'
    keys: string[]
    translateData: boolean
}

export const OpinionBlock = ({
    block,
    data,
    keys,
    units: defaultUnits = 'percentage_question',
    translateData = true
}: OpinionBlockProps) => {
    const { id } = block
    const [units, setUnits] = useState(defaultUnits)

    const [current, setCurrent] = useState<OpinionBucket['id'] | null>(null)

    const { translate } = useI18n()

    const chartOptions = useOptions(block.id)
    const bucketKeys = useLegends(block, chartOptions, 'opinions')

    const years = data.map(edition => edition.year)
    const allBuckets = data
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
            data={data}
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
