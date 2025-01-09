import React from 'react'
import { useEntities } from 'core/helpers/entities'
import { useColorScale } from '../common2/helpers/colors'
import { getQuestionGroups, getQuestionOptions } from '../horizontalBar2/helpers/options'
import { getAllFacetBucketIds } from '../horizontalBar2/helpers/other'
import { FacetTitle } from '../common2/FacetTitle'
import Legend from '../verticalBar2/Legend'

type FacetHeadingProps = {}

export const FacetHeading = (props: FacetHeadingProps) => {
    const {
        block,
        viewDefinition,
        facetQuestion,
        facetOptions,
        chartState,
        pageContext,
        series,
        question
    } = props
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const allOptions = getQuestionOptions({
        question: facetQuestion,
        chartState
    })
    const allGroups = getQuestionGroups({
        question: facetQuestion,
        chartState
    })
    const allGroupsOrOptions = allGroups?.length > 1 ? allGroups : allOptions

    // only keep options that are actually used in the current dataset
    // const usedOptions = allGroupsOrOptions.filter(optionOrGroup =>
    //     allFacetBucketIds.includes(String(optionOrGroup.id))
    // )
    const colorScale =
        facetQuestion && useColorScale({ question: { ...facetQuestion, options: facetOptions } })

    return (
        <div className="chart-heading">
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
                question={question}
            />
            {facetQuestion && colorScale && (
                <Legend
                    {...props}
                    options={facetOptions}
                    colorScale={colorScale}
                    i18nNamespace={facetQuestion.id}
                />
            )}
        </div>
    )
}
