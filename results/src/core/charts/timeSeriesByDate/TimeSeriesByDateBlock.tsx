import React from 'react'
import Metadata from '../common2/Metadata'
import { BlockComponentProps } from 'core/types'
import { StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getDefaultState, useChartState } from './helpers/chartState'
import { ChartFooter, ChartWrapper, GridWrapper, Note } from '../common2'
import ChartData from '../common2/ChartData'
import ChartShare from '../common2/ChartShare'
import { getViewDefinition } from './helpers/views'
import { VerticalBarSerieWrapper } from '../verticalBar2/VerticalBarSerieWrapper'
import { getChartCurrentEdition, useQuestionMetadata } from '../horizontalBar2/helpers/other'
import { TimeSeriesByDateChartState } from './types'
import { FacetHeading } from '../verticalBar2/FacetHeading'
import uniqBy from 'lodash/uniqBy'
import compact from 'lodash/compact'
import { CommonProps } from '../common2/types'
import { VerticalBarBlock2Props } from '../verticalBar2/VerticalBarBlock'

export const TimeSeriesByDateBlock = (props: VerticalBarBlock2Props) => {
    const { block, series, question, pageContext, variant } = props
    const currentEdition = getChartCurrentEdition({ serie: series[0], block })

    if (currentEdition === undefined) {
        throw new Error(`${block.id}: empty allEditions array`)
    }

    const { average, percentiles, completion } = currentEdition

    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)
    const chartState = useChartState(getDefaultState({ block, facetQuestion }))
    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const ViewComponent = viewDefinition.component

    const commonProps: CommonProps<TimeSeriesByDateChartState> & { viewDefinition: any } = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        viewDefinition,
        block,
        facetQuestion
    }

    if (facetQuestion) {
        const allFacetBuckets = series
            .map(serie => serie.data.responses.currentEdition.buckets.map(b => b?.facetBuckets))
            .flat()
            .flat()
            .flat()
        const facetBuckets = uniqBy(compact(allFacetBuckets), fb => fb.id)
        commonProps.facetBuckets = facetBuckets
    }

    return (
        <ChartWrapper block={block} question={question} className="chart-vertical-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}
                {facetQuestion && <FacetHeading<TimeSeriesByDateChartState> {...commonProps} />}
                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <VerticalBarSerieWrapper<StandardQuestionData, TimeSeriesByDateChartState>
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        >
                            <ViewComponent serie={serie} serieIndex={serieIndex} {...commonProps} />
                        </VerticalBarSerieWrapper>
                    ))}
                </GridWrapper>
                <Note block={block} />
                <ChartFooter
                    left={
                        <Metadata
                            average={average}
                            median={percentiles?.p50}
                            completion={completion}
                            {...commonProps}
                        />
                    }
                    right={
                        <>
                            <ChartShare {...commonProps} />
                            <ChartData {...commonProps} />
                        </>
                    }
                />
                {/* <Actions {...commonProps} /> */}
            </>
        </ChartWrapper>
    )
}
