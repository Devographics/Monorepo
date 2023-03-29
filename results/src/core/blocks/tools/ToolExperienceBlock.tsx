import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useLegends } from 'core/helpers/legends'
import { usePageContext } from 'core/helpers/pageContext'
import { groupDataByYears, getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_GRID } from 'core/blocks/filters/constants'
import { useEntity } from 'core/helpers/entities'
import { BucketUnits, ToolQuestionData } from '@devographics/types'
import { BlockComponentProps } from 'core/types'
import { ExperienceByYearBarChart } from 'core/charts/generic/ExperienceByYearBarChart'
import { useOptions } from 'core/helpers/options'

export const BAR_THICKNESS = 28
export const BAR_SPACING = 16

interface ToolExperienceBlockProps extends BlockComponentProps {
    data: ToolQuestionData
    closeComponent: any
}

// const processBlockData = (data: ToolQuestionData, { bucketKeys }) => {
//     const allEditions = data.responses.allEditions
//     return allEditions.map((editionData, index) => {
//         const yearData = bucketKeys.map((key: { id: string }) => {
//             const matchingBucket = editionData.buckets.find(bucket => bucket.id === key.id)
//             return (
//                 matchingBucket || {
//                     id: key.id,
//                     count: 0,
//                     percentage: 0
//                 }
//             )
//         })

//         const isLastYear = index === allEditions.length - 1

//         return {
//             year: editionData.year,
//             ...keyBy(yearData, 'id'),
//             thickness: isLastYear ? 2 : 1
//         }
//     })
// }

export const ToolExperienceBlock = ({
    block,
    keys,
    data,
    defaultUnits = BucketUnits.PERCENTAGE_QUESTION,
    closeComponent
}: ToolExperienceBlockProps) => {
    const context = usePageContext()
    const { locale } = context

    const [units, setUnits] = useState(defaultUnits)

    const entity = useEntity(block.id)
    const title = entity?.nameClean || entity?.name
    const titleLink = entity?.homepage?.url

    // as descriptions are extracted from best of js/github...
    // we only have english available.
    const description = locale?.id === 'en-US' && entity?.description

    const addNoAnswer = units === BucketUnits.PERCENTAGE_SURVEY

    const legends1 = useLegends({ block, addNoAnswer })

    const allYears = data.responses.allEditions
    const completion = allYears[allYears.length - 1]?.completion

    // const normalizedData = processBlockData(data, { bucketKeys })

    // if (allYears.length === 0) {
    //     return <div>no data</div>
    // }

    const chartHeight = (allYears.length - 1) * (BAR_THICKNESS + BAR_SPACING) + BAR_THICKNESS * 2

    const { chartFilters, setChartFilters } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    const defaultSeries = { name: 'default', data }

    return (
        <Block
            units={units}
            setUnits={setUnits}
            block={{ ...block, title, titleLink, description }}
            data={data}
            originalData={data}
            titleProps={{ closeComponent }}
            legends={legends}
            tables={[
                getTableData({
                    title: data?.entity?.name,
                    data: groupDataByYears({ keys, data: data.responses.allEditions }),
                    years: data.responses.allEditions.map(editionData => editionData.year),
                    translateData: true,
                    i18nNamespace: 'tools'
                })
            ]}
            completion={completion}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                defaultSeries={defaultSeries}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
            >
                <ChartContainer height={chartHeight} fit>
                    <ExperienceByYearBarChart
                        data={data}
                        bucketKeys={legends}
                        units={units}
                        spacing={BAR_SPACING}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default ToolExperienceBlock
