import React from 'react'
import { PageContextValue } from 'core/types'
import {
    BucketUnits,
    OrderOptions,
    QuestionMetadata,
    sortProperties,
    StandardQuestionData
} from '@devographics/types'
import { DataSeries } from 'core/filters/types'
import { getBlockAllFacetBucketIds } from './helpers/other'
import { useEntities } from 'core/helpers/entities'
import { FacetTitle } from '../common2/FacetTitle'
import { getQuestionGroups, getQuestionOptions } from './helpers/options'
import { useColorScale } from '../common2/helpers/colors'
import { HorizontalBarChartState, HorizontalBarViews } from './types'
import { CommonProps } from '../common2/types'
import Legend from './Legend'
import { getViewDefinition } from './helpers/views'
import { Toggle, ToggleValueType } from '../common2'
import { useI18n } from '@devographics/react-i18n'
import './FacetHeading.scss'
import { BoxplotAverage, BoxplotMedian } from './views'

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
    const isBoxPlot = [HorizontalBarViews.AVERAGE, HorizontalBarViews.BOXPLOT].includes(view)

    return (
        <div className={`chart-heading chart-heading-${isBoxPlot ? 'withToggle' : ''}`}>
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
                question={question}
                chartState={chartState}
            />
            {isBoxPlot && (
                <div className="chart-heading-toggles">
                    <BoxplotToggle question={question} chartState={chartState} />
                </div>
            )}
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

const BoxplotToggle = ({
    question,
    chartState
}: {
    question: QuestionMetadata
    chartState: HorizontalBarChartState
}) => {
    const { getString } = useI18n()
    const { view, setView, order, setOrder, defaultSort, sort, setSort } = chartState
    const viewDefinitions = [BoxplotMedian, BoxplotAverage]

    const items = viewDefinitions.map(viewDefinition => {
        const { id: viewId, defaultUnits } = viewDefinition
        const labelKey = `chart_units.${defaultUnits}`
        return {
            labelKey,
            id: defaultUnits,
            viewId,
            isEnabled: sort === defaultUnits,
            label: getString(labelKey)?.t
        }
    })

    const handleSelect = (itemId: ToggleValueType | null) => {
        const selectedItem = items.find(item => item.id === itemId)
        if (!selectedItem) {
            return
        }
        const { id, viewId } = selectedItem

        if (defaultSort === sortProperties.OPTIONS) {
            // scenario 1: question is sorted by options,
            // only change view
            setView(viewId as HorizontalBarViews)
        } else {
            // scenario 2: change both view and sort, and optionally
            // sort order too
            setView(viewId as HorizontalBarViews)
            setSort(id as string)
            if (order === OrderOptions.ASC) {
                setOrder(OrderOptions.DESC)
            } else {
                setOrder(OrderOptions.ASC)
            }
        }
    }

    return (
        <>
            <Toggle
                // labelId="charts.toggle_view"
                handleSelect={handleSelect}
                sortId={sort}
                sortOrder={order}
                items={items}
            />
        </>
    )
}

export default FacetHeading
