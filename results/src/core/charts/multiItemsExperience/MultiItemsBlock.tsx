import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import { COMMENTS, GroupingOptions, MultiItemSerie } from './types'
import { useChartState } from './helpers/chartState'
import { ChartControls, ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { useTheme } from 'styled-components'
import { NoteContents } from './MultiItemsNote'
import ChartShare from '../common2/ChartShare'
import ViewSwitcher from '../horizontalBar2/ViewSwitcher'
import MultiItemsSerie from './MultiItemsSerie'
import MultiItemsCategories from './MultiItemsCategories'
import { MultiItemsStats } from './MultiItemsStats'
import ChartData from '../common2/ChartData'
import { BlockComponentProps } from 'core/types'

const defaultLimit = 5

export interface MultiItemsExperienceBlockProps extends BlockComponentProps {
    series: MultiItemSerie[]
}

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { series, block, question, pageContext } = props
    const theme = useTheme()

    const chartState = useChartState({ rowsLimit: block?.chartOptions?.limit || defaultLimit })
    const { grouping } = chartState

    const className = `multiexp multiexp-groupedBy-${grouping}`

    // not used but expected by Rows.tsx
    const viewDefinition = {
        formatValue: (v: any) => v
    }

    const commonProps = {
        chartState,
        block,
        question,
        pageContext,
        series,
        viewDefinition
    }

    const options =
        grouping === GroupingOptions.EXPERIENCE
            ? Object.values(FeaturesOptions).map(option => ({ id: option }))
            : Object.values(SimplifiedSentimentOptions).map(option => ({ id: option }))

    const colorScale =
        grouping === GroupingOptions.EXPERIENCE
            ? theme.colors.ranges.features
            : theme.colors.ranges.sentiment

    return (
        <ChartWrapper question={question} className={className}>
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}
                <ChartControls
                    top={
                        block?.chartOptions?.categories ? (
                            <MultiItemsCategories {...commonProps} />
                        ) : undefined
                    }
                    left={<MultiItemsExperienceControls {...commonProps} />}
                    right={
                        <ViewSwitcher
                            {...commonProps}
                            options={[...options, { id: COMMENTS }]}
                            colorScale={colorScale}
                            i18nNamespace={grouping}
                        />
                    }
                />

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <MultiItemsSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        />
                    ))}
                </GridWrapper>

                {/* <Rows {...commonProps}>
                    {combinedItems.map((item, i) => (
                        <Row key={item.id + i} rowIndex={i} item={item} {...commonProps} />
                    ))}
                </Rows> */}

                <Note block={block}>
                    <NoteContents />
                </Note>
                <ChartFooter
                    left={<MultiItemsStats {...commonProps} />}
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

export default MultiItemsExperienceBlock
