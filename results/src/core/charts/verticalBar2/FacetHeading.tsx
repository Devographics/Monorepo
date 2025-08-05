import React from 'react'
import { useEntities } from 'core/helpers/entities'
import { useColorScale } from '../common2/helpers/colors'
import { FacetTitle } from '../common2/FacetTitle'
import Legend from '../verticalBar2/Legend'
import { CommonProps } from '../common2/types'
import { OptionMetadata } from '@devographics/types'

type FacetHeadingProps<ChartStateType> = CommonProps<ChartStateType>

export const FacetHeading = <ChartStateType,>(props: FacetHeadingProps<ChartStateType>) => {
    const { block, facetQuestion, facetBuckets, chartState, pageContext, question } = props
    const entities = useEntities()

    // by using facetBuckets as options we only keep options that are actually used in the current dataset
    const options = facetBuckets as OptionMetadata[]

    const colorScale =
        facetQuestion &&
        useColorScale({
            question: facetQuestion
        })
    console.log(colorScale)
    console.log(facetQuestion)
    return (
        <div className="chart-heading">
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
                question={question}
                chartState={chartState}
            />
            {facetQuestion && colorScale && (
                <Legend
                    {...props}
                    options={options}
                    colorScale={colorScale}
                    i18nNamespace={facetQuestion.id}
                    enableSort={false}
                />
            )}
        </div>
    )
}
