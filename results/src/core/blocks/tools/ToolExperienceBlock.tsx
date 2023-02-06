import React, { useMemo, useState } from 'react'
import keyBy from 'lodash/keyBy'
import { BlockContext } from 'core/blocks/types'
import { ToolAllYearsExperience, ToolExperienceBucket } from 'core/survey_api/tools'
// @ts-ignore
import Block from 'core/blocks/block/BlockVariant'
// @ts-ignore
import ChartContainer from 'core/charts/ChartContainer'
// @ts-ignore
import { useLegends } from 'core/helpers/useBucketKeys'
// @ts-ignore
import { usePageContext } from 'core/helpers/pageContext'
import { ExperienceByYearBarChart } from 'core/charts/generic/ExperienceByYearBarChart'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { groupDataByYears, getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_GRID } from 'core/blocks/filters/constants'

const BAR_THICKNESS = 28
const BAR_SPACING = 16

interface ToolExperienceBlockProps {
    block: BlockContext<'toolExperienceTemplate', 'ToolExperienceBlock', { toolIds: string }>
    data: ToolAllYearsExperience
    keys: string[]
    units?: 'percentage_survey' | 'percentage_question' | 'count'
    closeComponent: any
}

const processBlockData = (data, { bucketKeys }) => {
    const allYears = data.experience.all_years
    return allYears.map((yearExperience, index) => {
        const yearData: ToolExperienceBucket[] = bucketKeys.map((key: { id: string }) => {
            const matchingBucket = yearExperience.facets[0].buckets.find(
                bucket => bucket.id === key.id
            )
            return (
                matchingBucket || {
                    id: key.id,
                    count: 0,
                    percentage: 0
                }
            )
        })

        const isLastYear = index === allYears.length - 1

        return {
            year: yearExperience.year,
            ...keyBy(yearData, 'id'),
            thickness: isLastYear ? 2 : 1
        }
    })
}

export const ToolExperienceBlock = ({
    block,
    keys,
    data,
    units: defaultUnits = 'percentage_question',
    closeComponent
}: ToolExperienceBlockProps) => {
    const context = usePageContext()
    const { locale } = context
    const { translate } = useI18n()

    const [units, setUnits] = useState(defaultUnits)

    const title = data.entity.name
    const titleLink = data?.entity?.homepage?.url

    // as descriptions are extracted from best of js/github...
    // we only have english available.
    const description = locale.id === 'en-US' && data.entity.description

    const bucketKeys = useLegends(block, keys, 'tools')

    const allYears = data.experience.all_years
    const completion = allYears[allYears.length - 1]?.completion

    const normalizedData = processBlockData(data, { bucketKeys })

    if (allYears.length === 0) {
        return <div>no data</div>
    }

    const chartHeight = (allYears.length - 1) * (BAR_THICKNESS + BAR_SPACING) + BAR_THICKNESS * 2

    const { chartFilters, setChartFilters, legends } = useChartFilters({ block, options: { supportedModes: [MODE_GRID], enableYearSelect: false }})

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
                    data: groupDataByYears({ keys, data: data.experience.all_years }),
                    years: data.experience.all_years.map(y => y.year),
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
