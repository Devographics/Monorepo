import React from 'react'
import './VerticalBar.scss'
import Metadata from '../common2/Metadata'
import { BlockComponentProps, PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getAllFacetBucketIds, useQuestionMetadata } from '../horizontalBar2/helpers/other'
import { getDefaultState, useChartState } from './helpers/chartState'
import { getViewDefinition } from './helpers/views'
import { getChartCurrentEdition } from './helpers/other'
import { ChartFooter, ChartWrapper, GridWrapper, Legend, Note } from '../common2'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionOptions } from '../horizontalBar2/helpers/options'
import { useColorScale } from '../horizontalBar2/helpers/colors'
import { ChartState } from './types'
import { CommonProps } from '../common2/types'
import ChartData from '../common2/ChartData'
import { HorizontalBarSerie } from './HorizontalBarSerie'
import { getBlockNoteKey } from 'core/helpers/blockHelpers'
import { useI18n } from '@devographics/react-i18n'
import { VerticalBarSerie } from './VerticalBarSerie'

export interface VerticalBarBlock2Props extends BlockComponentProps {
    data: StandardQuestionData
    series: DataSeries<StandardQuestionData>[]
}

/*

Note: always used for historical data

*/
export const VerticalBarBlock2 = (props: VerticalBarBlock2Props) => {
    const { getString } = useI18n()
    const { block, series, question, pageContext, variant } = props
    console.log(series)
    const currentEdition = getChartCurrentEdition({ serie: series[0], block })
    const { average, percentiles, completion } = currentEdition

    const facet = block?.filtersState?.facet

    const facetQuestion = useQuestionMetadata(facet)

    const chartState = useChartState(getDefaultState({ facetQuestion, block }))

    const commonProps: CommonProps = {
        variant,
        question,
        series,
        pageContext,
        chartState,
        block
    }

    const key = getBlockNoteKey({ block })
    const note = getString(key, {}, null)?.t

    return (
        <ChartWrapper className="chart-vertical-bar">
            <>
                {/* <pre>
                    <code>{JSON.stringify(chartState, null, 2)}</code>
                </pre> */}

                {/* {facetQuestion && <FacetHeading facetQuestion={facetQuestion} {...commonProps} />} */}

                <GridWrapper seriesCount={series.length}>
                    {series.map((serie, serieIndex) => (
                        <VerticalBarSerie
                            key={serie.name}
                            serie={serie}
                            serieIndex={serieIndex}
                            {...commonProps}
                        />
                    ))}
                </GridWrapper>

                <ChartFooter>
                    <>
                        <Metadata
                            average={average}
                            median={percentiles?.p50}
                            completion={completion}
                            {...commonProps}
                        />
                        <ChartData {...commonProps} />
                    </>
                </ChartFooter>
                {/* <Actions {...commonProps} /> */}
                {/* <pre>
                <code>{JSON.stringify(buckets, null, 2)}</code>
            </pre> */}

                {/* <pre>
                <code>{JSON.stringify(chartValues, null, 2)}</code>
            </pre> */}

                {note && <Note>{note}</Note>}
            </>
        </ChartWrapper>
    )
}

const FacetHeading = (
    props: CommonProps & {
        series: DataSeries<StandardQuestionData>[]
        facetQuestion: QuestionMetadata
        chartState: ChartState
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, pageContext, series } = props
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const viewDefinition = getViewDefinition(chartState.view)
    const colorScale = facetQuestion && useColorScale({ question: facetQuestion })

    const allOptions = getQuestionOptions({
        question: facetQuestion,
        chartState
    })

    const allFacetBucketIds = getAllFacetBucketIds({ series, block, chartState })

    // only keep options that are actually used in the current dataset
    const usedOptions = allOptions.filter(option => allFacetBucketIds.includes(String(option.id)))

    return (
        <div className="chart-heading">
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
            />
            {viewDefinition.showLegend && facetQuestion && colorScale && (
                <Legend
                    {...props}
                    options={usedOptions}
                    colorScale={colorScale}
                    i18nNamespace={facetQuestion.id}
                />
            )}
        </div>
    )
}

export default VerticalBarBlock2
