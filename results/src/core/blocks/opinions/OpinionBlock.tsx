import React, { useMemo, useState } from 'react'
import { BlockContext } from 'core/blocks/types'
import { OpinionBucket, OpinionAllYearsData } from 'core/survey_api/opinions'
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

const OPINION_BUCKET_KEYS_ID = 'opinions'

interface OpinionBlockProps {
    block: BlockContext<'opinionTemplate', 'OpinionBlock'>
    data: OpinionAllYearsData
    units: 'percentage_survey' | 'percentage_question' | 'count'
    keys: string[]
}



export const OpinionBlock = ({
    block,
    data,
    keys,
    units: defaultUnits = 'percentage_question',
    translateData = true,
}: OpinionBlockProps) => {
    const { id } = block
    const [units, setUnits] = useState(defaultUnits)

    const [current, setCurrent] = useState<OpinionBucket['id'] | null>(null)

    const { translate } = useI18n()

    const bucketKeys = useLegends(block, keys, 'opinions')

    // fix potentially undefined buckets
    const normalizedData = useMemo(
        () =>
            data.map((yearData) => ({
                ...yearData,
                buckets: bucketKeys.map(({ id }) => {
                    const matchingBucket = yearData.facets[0].buckets.find(
                        (bucket) => bucket.id === id
                    )
                    if (matchingBucket) {
                        return matchingBucket
                    }

                    return {
                        id,
                        count: 0,
                        percentage: 0,
                    }
                }),
            })),
        [data, bucketKeys]
    )

    const years = data.map((y) => y.year)

    const valueKeys: BlockUnits[] = ['percentage_survey', 'percentage_question', 'count']

    const tableData = groupDataByYears({ keys, data, valueKeys })

    return (
        <Block
            units={units}
            setUnits={setUnits}
            block={{
                ...block,
                showLegend: true,
                bucketKeysName: OPINION_BUCKET_KEYS_ID,
            }}
            legends={bucketKeys}
            data={data}
            legendProps={{
                onMouseEnter: ({ id }: { id: OpinionBucket['id'] }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                },
            }}
            tables={[
                getTableData({
                    data: tableData,
                    valueKeys,
                    years,
                }),
            ]}
        >
            <ChartContainer height={300} fit={true}>
                <StreamChart
                    colorScale={bucketKeys.map((key) => key.color)}
                    current={current}
                    // for opinions only having one year of data, we duplicate the year's data
                    // to be able to use the stream chart.
                    data={
                        normalizedData.length === 1
                            ? [normalizedData[0], normalizedData[0]]
                            : normalizedData
                    }
                    bucketKeys={bucketKeys}
                    keys={bucketKeys.map((key) => key.id)}
                    units={units}
                    applyEmptyPatternTo={2}
                    namespace={id}
                    translateData={translateData}
                />
            </ChartContainer>
        </Block>
    )
}

export default OpinionBlock
