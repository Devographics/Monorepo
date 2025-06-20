import React from 'react'
import { useEntities } from 'core/helpers/entities'
import { useColorScale } from '../common2/helpers/colors'
import { getQuestionGroups, getQuestionOptions } from '../horizontalBar2/helpers/options'
import { getBlockAllFacetBucketIds } from '../horizontalBar2/helpers/other'
import { FacetTitle } from '../common2/FacetTitle'
import Legend from '../verticalBar2/Legend'
import { CommonProps } from '../common2/types'
import { OptionMetadata } from '@devographics/types'

type FacetHeadingProps<ChartStateType> = CommonProps<ChartStateType>

export const FacetHeading = <ChartStateType,>(props: FacetHeadingProps<ChartStateType>) => {
    const { block, facetQuestion, facetBuckets, chartState, pageContext, question } = props
    const entities = useEntities()

    // const controls = getControls({ chartState, chartValues })

    const allOptions = getQuestionOptions<ChartStateType>({
        question: facetQuestion,
        chartState
    })
    const allGroups = getQuestionGroups<ChartStateType>({
        question: facetQuestion,
        chartState
    })
    const allGroupsOrOptions = allGroups?.length > 1 ? allGroups : allOptions

    // only keep options that are actually used in the current dataset
    // const usedOptions = allGroupsOrOptions.filter(optionOrGroup =>
    //     allFacetBucketIds.includes(String(optionOrGroup.id))
    // )
    const colorScale =
        facetQuestion &&
        useColorScale({
            question: { ...facetQuestion, options: facetBuckets }
        })

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
                    options={facetBuckets as OptionMetadata[]}
                    colorScale={colorScale}
                    i18nNamespace={facetQuestion.id}
                    enableSort={false}
                />
            )}
        </div>
    )
}
