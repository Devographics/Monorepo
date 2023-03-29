import React, { useState } from 'react'
import styled from 'styled-components'
import Block from 'core/blocks/block/BlockVariant'
import ChartContainer from 'core/charts/ChartContainer'
import GaugeBarChart from 'core/charts/generic/GaugeBarChart'
import { usePageContext } from 'core/helpers/pageContext'
import { useLegends } from 'core/helpers/legends'
import { mq, spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'
import { getTableData, groupDataByYears } from 'core/helpers/datatables'
import DynamicDataLoader from 'core/blocks/filters/dataloaders/DynamicDataLoader'
import { useChartFilters } from 'core/blocks/filters/helpers'
import { MODE_GRID } from 'core/blocks/filters/constants'
import { useOptions } from 'core/helpers/options'
import { BucketUnits, FeatureQuestionData } from '@devographics/types'
import { BlockComponentProps } from 'core/types'
import { BAR_THICKNESS, BAR_SPACING } from 'core/blocks/tools/ToolExperienceBlock'
import {
    ExperienceByYearBarChart,
    getChartData
} from 'core/charts/generic/ExperienceByYearBarChart'

// convert relative links into absolute MDN links
const parseMDNLinks = (content: string) =>
    content.replace(new RegExp(`href="/`, 'g'), `href="https://developer.mozilla.org/`)

interface FeatureExperienceBlockProps extends BlockComponentProps {
    data: FeatureQuestionData
}

const FeatureExperienceBlock = ({
    block,
    keys,
    data,
    chartNamespace = 'features',
    defaultUnits = BucketUnits.PERCENTAGE_QUESTION
}: FeatureExperienceBlockProps) => {
    const [units, setUnits] = useState(defaultUnits)
    const entity = data.entity
    const context = usePageContext()
    const { locale } = context
    const { name, mdn } = entity
    const { translate } = useI18n()

    const chartOptions = useOptions(block.id)
    const legends = useLegends({ block })

    const mdnLink = mdn && `https://developer.mozilla.org${mdn.url}`
    // only show descriptions for english version
    const description = locale.id === 'en-US' && mdn && parseMDNLinks(mdn.summary)

    const buckets = data

    const { chartFilters, setChartFilters } = useChartFilters({
        block,
        options: { supportedModes: [MODE_GRID], enableYearSelect: false }
    })

    const defaultSeries = { name: 'default', data }

    const chartData = getChartData(data)

    return (
        <Block
            tables={[
                getTableData({
                    legends,
                    data: groupDataByYears({ keys, data: chartData }),
                    years: chartData.map(y => y.year)
                })
            ]}
            legends={legends}
            title={name}
            units={units}
            setUnits={setUnits}
            originalData={data}
            data={chartData}
            block={{
                ...block,
                title: name,
                titleLink: mdnLink,
                description,
                enableDescriptionMarkdown: false
            }}
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
                <ExperienceByYearBarChart
                    data={data}
                    bucketKeys={bucketKeys}
                    units={units}
                    spacing={BAR_SPACING}
                />
                {/* <FeatureExperienceChart
                    keys={chartOptions}
                    data={data}
                    bucketKeys={legends}
                    units={units}
                    chartNamespace={chartNamespace}
                /> */}
            </DynamicDataLoader>
        </Block>
    )
}

// type FeatureExperienceChartProps = {
//     data: FeatureQuestionData
//     keys: any
//     bucketKeys: any
//     units: BucketUnits
//     chartNamespace: string
// }

// const FeatureExperienceChart = ({
//     data,
//     keys,
//     bucketKeys,
//     units,
//     chartNamespace
// }: FeatureExperienceChartProps) => {
//     const editions = getChartData(data)
//     const isLastEdition = edition =>
//         editions.findIndex(y => y.year === edition) === editions.length - 1

//     return (
//         <dl>
//             {editions.map(edition => (
//                 <Row key={edition.year}>
//                     <RowYear>{edition.year}</RowYear>
//                     <RowChart className="FeatureExperienceBlock__RowChart">
//                         <ChartContainer
//                             height={isLastEdition(edition.year) ? 40 : 40}
//                             fit={true}
//                             className="FeatureChart"
//                         >
//                             <GaugeBarChart
//                                 keys={keys}
//                                 buckets={edition.buckets}
//                                 colorMapping={bucketKeys}
//                                 units={units}
//                                 applyEmptyPatternTo="never_heard"
//                                 i18nNamespace={chartNamespace}
//                                 showProgression={isLastEdition(edition.year)}
//                             />
//                         </ChartContainer>
//                     </RowChart>
//                 </Row>
//             ))}
//         </dl>
//     )
// }
// const Row = styled.div`
//     display: grid;
//     grid-template-columns: auto 1fr;
//     column-gap: ${spacing()};
//     align-items: center;
//     margin-bottom: ${spacing()};
// `

// const RowYear = styled.dt`
//     font-weight: bold;
//     margin: 0;
// `
// const RowChart = styled.dd`
//     margin: 0;

//     @media ${mq.smallMedium} {
//         max-width: calc(
//             100vw - 40px - 30px - 20px
//         ); /* total width - page padding - year width - gap */
//     }
// `

export default FeatureExperienceBlock
