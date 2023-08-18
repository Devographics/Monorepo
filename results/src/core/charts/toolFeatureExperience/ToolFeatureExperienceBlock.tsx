import React, { useState } from 'react'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import { useLegends } from 'core/helpers/legends'
import { usePageContext } from 'core/helpers/pageContext'
import { groupDataByYears, getTableData } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/filters/helpers'
import { MODE_GRID } from 'core/filters/constants'
import { useEntity } from 'core/helpers/entities'
import { BucketUnits, FeatureQuestionData, ToolQuestionData } from '@devographics/types'
import { BlockComponentProps } from 'core/types'
import { ExperienceByYearBarChart } from 'core/charts/toolFeatureExperience/ExperienceByYearBarChart'
import { FEATURES_OPTIONS, TOOLS_OPTIONS } from '@devographics/constants'

export const BAR_THICKNESS = 28
export const BAR_SPACING = 16

interface ToolFeatureExperienceBlockProps extends BlockComponentProps {
    data: ToolQuestionData | FeatureQuestionData
    closeComponent: any
}

export const ToolFeatureExperienceBlock = ({
    block,
    data,
    defaultUnits = BucketUnits.PERCENTAGE_QUESTION,
    closeComponent
}: ToolFeatureExperienceBlockProps) => {
    const context = usePageContext()
    const { locale } = context
    const { i18nNamespace } = block
    const [units, setUnits] = useState(defaultUnits)

    const entity = useEntity(block.id)
    const title = entity?.nameClean || entity?.name
    const titleLink = entity?.homepage?.url

    // as descriptions are extracted from best of js/github...
    // we only have english available.
    const description = locale?.id === 'en-US' && entity?.description

    const addNoAnswer = units === BucketUnits.PERCENTAGE_SURVEY

    const legends = useLegends({ block, addNoAnswer })

    const allYears = data.responses.allEditions
    const completion = allYears[allYears.length - 1]?.completion

    const chartHeight = (allYears.length - 1) * (BAR_THICKNESS + BAR_SPACING) + BAR_THICKNESS * 2

    const { chartFilters, setChartFilters } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    const defaultSeries = { name: 'default', data }

    const keys = i18nNamespace === 'features' ? FEATURES_OPTIONS : TOOLS_OPTIONS

    const tables = [
        getTableData({
            title: data?.entity?.name,
            data: groupDataByYears({ keys, data: allYears }),
            years: data.responses.allEditions.map(editionData => editionData.year),
            translateData: true,
            i18nNamespace
        })
    ]

    return (
        <Block
            units={units}
            setUnits={setUnits}
            block={{ ...block, title, titleLink, description }}
            data={data}
            entity={data.entity}
            originalData={data}
            titleProps={{ closeComponent }}
            legends={legends}
            tables={tables}
            completion={completion}
            chartFilters={chartFilters}
            setChartFilters={setChartFilters}
        >
            <DynamicDataLoader
                setUnits={setUnits}
                defaultSeries={defaultSeries}
                block={block}
                chartFilters={chartFilters}
                layout="grid"
            >
                <ChartContainer height={chartHeight} fit>
                    <ExperienceByYearBarChart
                        data={data}
                        legends={legends}
                        units={units}
                        spacing={BAR_SPACING}
                    />
                </ChartContainer>
            </DynamicDataLoader>
        </Block>
    )
}

export default ToolFeatureExperienceBlock
