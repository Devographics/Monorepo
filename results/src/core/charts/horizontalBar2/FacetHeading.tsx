import React from 'react'
import { PageContextValue } from 'core/types'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getBlockAllFacetBucketIds } from './helpers/other'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionGroups, getQuestionOptions } from './helpers/options'
import { useColorScale } from '../common2/helpers/colors'
import { HorizontalBarChartState } from './types'
import { CommonProps } from '../common2/types'
import Legend from './Legend'
import { getViewDefinition } from './helpers/views'

export const FacetHeading = (
    props: CommonProps<HorizontalBarChartState> & {
        series: DataSeries<StandardQuestionData>[]
        facetQuestion: QuestionMetadata
        chartState: HorizontalBarChartState
        pageContext: PageContextValue
    }
) => {
    const { block, facetQuestion, chartState, pageContext, series, question } = props
    const { view } = chartState
    const viewDefinition = getViewDefinition(view)
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const facetBucketIds = getBlockAllFacetBucketIds({ series, block, chartState })

    const colorScale =
        facetQuestion && useColorScale({ question: facetQuestion, bucketIds: facetBucketIds })

    const allOptions = getQuestionOptions({
        question: facetQuestion,
        chartState
    })
    const allGroups = getQuestionGroups({
        question: facetQuestion,
        chartState
    })
    const allGroupsOrOptions = allGroups?.length > 1 ? allGroups : allOptions

    const allFacetBucketIds = getBlockAllFacetBucketIds({ series, block, chartState })

    // only keep options that are actually used in the current dataset
    const usedOptions = allGroupsOrOptions.filter(optionOrGroup =>
        allFacetBucketIds.includes(String(optionOrGroup.id))
    )
    return (
        <div className="chart-heading">
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
                question={question}
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
export default FacetHeading
