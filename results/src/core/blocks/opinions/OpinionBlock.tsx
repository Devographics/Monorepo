import React, { useMemo, useState } from 'react'
import { BlockContext } from 'core/blocks/types'
import { OpinionBucket, OpinionAllYearsData } from 'core/survey_api/opinions'
// @ts-ignore
import Block from 'core/blocks/block/Block'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
// @ts-ignore
import StreamChart from 'core/charts/generic/StreamChart'
// @ts-ignore
import { useBucketKeys, useLegends } from 'core/helpers/useBucketKeys'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'

const OPINION_BUCKET_KEYS_ID = 'opinions'

interface OpinionBlockProps {
    block: BlockContext<'opinionTemplate', 'OpinionBlock'>
    data: OpinionAllYearsData
    units: 'percentage_survey' | 'percentage_question' |'count'
    keys: string[]
}

export const OpinionBlock = ({
    block,
    data,
    keys,
    units: defaultUnits = 'percentage_question',
}: OpinionBlockProps) => {
    const { id } = block
    const [units, setUnits] = useState(defaultUnits)
    const [view, setView] = useState('viz')
    const [current, setCurrent] = useState<OpinionBucket['id'] | null>(null)

    const { translate } = useI18n()

    const bucketKeys = useLegends(block, keys, 'opinions')

    // fix potentially undefined buckets
    const normalizedData = useMemo(
        () =>
            data.map((yearData) => ({
                ...yearData,
                buckets: bucketKeys.map(({ id }) => {
                    const matchingBucket = yearData.facets[0].buckets.find((bucket) => bucket.id === id)
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

    let headings = [{id: 'label', label: translate('table.year'), shortLabel: translate('table.year'), color: ''}];
    headings = headings.concat(bucketKeys);

    const generateRows = (data) => {
      const rows = [];
      data.forEach((row) => {
        const newRow = [];
        newRow.push({id: 'label', label: row.year});
        row.facets[0].buckets.forEach((bucket) => newRow.push({id: bucket.id, label: `${bucket.percentage_survey}% (${bucket.count})`}));
        rows.push(newRow);
      });

      return rows;
    }

    const tables = [{
      headings: headings,
      rows: generateRows(normalizedData),
    }];
    
    return (
        <Block
            view={view}
            setView={setView}
            units={units}
            setUnits={setUnits}
            block={{
                ...block,
                showLegend: true,
                bucketKeysName: OPINION_BUCKET_KEYS_ID,
            }}
            data={data}
            legendProps={{
                onMouseEnter: ({ id }: { id: OpinionBucket['id'] }) => {
                    setCurrent(id)
                },
                onMouseLeave: () => {
                    setCurrent(null)
                },
            }}
            tables={tables}
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
                />
            </ChartContainer>
        </Block>
    )
}

export default OpinionBlock