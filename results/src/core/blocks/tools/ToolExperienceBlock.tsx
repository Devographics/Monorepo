import React, { useMemo, useState } from 'react'
import keyBy from 'lodash/keyBy'
import { BlockContext } from 'core/blocks/types'
import { ToolAllYearsExperience, ToolExperienceBucket } from '@types/survey_api/tools'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useLegends } from 'core/helpers/useBucketKeys'
import { usePageContext } from 'core/helpers/pageContext'
import { ExperienceByYearBarChart } from 'core/charts/generic/ExperienceByYearBarChart'
import { useI18n } from 'core/i18n/i18nContext'
import { groupDataByYears, getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_GRID } from 'core/blocks/filters/constants'
import { useEntity } from 'core/helpers/entities'
import { ToolQuestionData } from '@devographics/types'
import { TOOLS_OPTIONS } from '@devographics/constants'

const BAR_THICKNESS = 28
const BAR_SPACING = 16

interface ToolExperienceBlockProps {
    block: BlockContext<'toolExperienceTemplate', 'ToolExperienceBlock', { toolIds: string }>
    data: ToolQuestionData
    keys: string[]
    units?: 'percentageSurvey' | 'percentageQuestion' | 'count'
    closeComponent: any
}

const processBlockData = (data: ToolQuestionData, { bucketKeys }) => {
    const allEditions = data.responses.allEditions
    return allEditions.map((editionData, index) => {
        const yearData = bucketKeys.map((key: { id: string }) => {
            const matchingBucket = editionData.buckets.find(bucket => bucket.id === key.id)
            return (
                matchingBucket || {
                    id: key.id,
                    count: 0,
                    percentage: 0
                }
            )
        })

        const isLastYear = index === allEditions.length - 1

        return {
            year: editionData.year,
            ...keyBy(yearData, 'id'),
            thickness: isLastYear ? 2 : 1
        }
    })
}

export const ToolExperienceBlock = ({
    block,
    keys,
    data,
    units: defaultUnits = 'percentageQuestion',
    closeComponent
}: ToolExperienceBlockProps) => {
    const context = usePageContext()
    const { locale } = context
    const { translate } = useI18n()

    const [units, setUnits] = useState(defaultUnits)

    const entity = useEntity(block.id)
    const title = entity?.nameClean || entity?.name
    const titleLink = entity?.homepage?.url

    // as descriptions are extracted from best of js/github...
    // we only have english available.
    const description = locale?.id === 'en-US' && entity?.description

    const chartOptions = TOOLS_OPTIONS
    const bucketKeys = useLegends(block, chartOptions, 'tools')

    const allYears = data.responses.allEditions
    const completion = allYears[allYears.length - 1]?.completion

    const normalizedData = processBlockData(data, { bucketKeys })

    if (allYears.length === 0) {
        return <div>no data</div>
    }

    const chartHeight = (allYears.length - 1) * (BAR_THICKNESS + BAR_SPACING) + BAR_THICKNESS * 2

    const { chartFilters, setChartFilters, legends } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    return (
        <Block
            units={units}
            setUnits={setUnits}
            block={{ ...block, title, titleLink, description }}
            data={data}
            originalData={data}
            titleProps={{ closeComponent }}
            legends={bucketKeys}
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
                defaultBuckets={normalizedData}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
                processBlockData={processBlockData}
                processBlockDataOptions={{ bucketKeys }}
            >
                <ChartContainer height={chartHeight} fit>
                    <ExperienceByYearBarChart
                        buckets={normalizedData}
                        bucketKeys={bucketKeys}
                        units={units}
                        spacing={BAR_SPACING}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default ToolExperienceBlock
