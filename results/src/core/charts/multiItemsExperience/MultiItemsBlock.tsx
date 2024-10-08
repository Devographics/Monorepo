import React from 'react'
import '../common2/ChartsCommon.scss'
import './MultiItems.scss'
import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { MultiItemsExperienceControls } from './MultiItemsControls'
import { GroupingOptions, MultiItemsExperienceBlockProps } from './types'
import { useChartState } from './helpers'
import { ChartControls, ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import { useTheme } from 'styled-components'
import { NoteContents } from './MultiItemsNote'
import ChartShare from '../common2/ChartShare'
import ViewSwitcher from '../horizontalBar2/ViewSwitcher'
import MultiItemsSerie from './MultiItemsSerie'
import MultiItemsCategories from './MultiItemsCategories'

const defaultLimit = 5

export const MultiItemsExperienceBlock = (props: MultiItemsExperienceBlockProps) => {
    const { series, block, question, pageContext } = props
    const theme = useTheme()

    const chartState = useChartState({ rowsLimit: block?.chartOptions?.limit || defaultLimit })
    const { grouping } = chartState

    const className = `multiexp multiexp-groupedBy-${grouping}`

    const commonProps = {
        chartState,
        block,
        question,
        pageContext,
        series
    }

    const options =
        grouping === GroupingOptions.EXPERIENCE
            ? Object.values(FeaturesOptions).map(option => ({ id: option }))
            : Object.values(SimplifiedSentimentOptions)
                  .filter(o => o !== SimplifiedSentimentOptions.NEUTRAL_SENTIMENT)
                  .map(option => ({ id: option }))

    const colorScale =
        grouping === GroupingOptions.EXPERIENCE
            ? theme.colors.ranges.features
            : theme.colors.ranges.sentiment

    return (
        <ChartWrapper className={className}>
            <>
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
                            options={options}
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
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            {/* <ChartData {...commonProps} /> */}
                        </>
                    }
                />
            </>
        </ChartWrapper>
    )
}

export default MultiItemsExperienceBlock
