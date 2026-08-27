import React from 'react'
import { PageContextValue } from 'core/types'
import { OrderOptions, QuestionMetadata, StandardQuestionData } from '@devographics/types'
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
import { Toggle } from '../common2'
import { useI18n } from '@devographics/react-i18n'
import './FacetHeading.scss'

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
    const showToggle = [HorizontalBarViews.AVERAGE, HorizontalBarViews.BOXPLOT].includes(view)
    return (
        <div className={`chart-heading chart-heading-${showToggle ? 'withToggle' : ''}`}>
            <FacetTitle
                block={block}
                facetQuestion={facetQuestion}
                pageContext={pageContext}
                entities={entities}
                question={question}
                chartState={chartState}
            />
            {showToggle && (
                <div className="chart-heading-toggles">
                    <ViewToggle chartState={chartState} />
                    <OrderToggle chartState={chartState} />
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

const ViewToggle = ({ chartState }: { chartState: HorizontalBarChartState }) => {
    const { getString } = useI18n()
    const { view, setView } = chartState
    const items = [HorizontalBarViews.BOXPLOT, HorizontalBarViews.AVERAGE].map(id => {
        const labelKey = `chart_units.${id}`
        return {
            labelKey,
            id,
            isEnabled: view === id,
            label: getString(labelKey)?.t
        }
    })
    return (
        <Toggle
            labelId="charts.toggle_view"
            handleSelect={id => {
                setView(id as HorizontalBarViews)
            }}
            items={items}
        />
    )
}

const OrderToggle = ({ chartState }: { chartState: HorizontalBarChartState }) => {
    const { getString } = useI18n()
    const { order, setOrder } = chartState
    const items = [OrderOptions.DESC, OrderOptions.ASC].map(id => {
        const labelKey = `charts.order.${id}`
        return {
            labelKey,
            id,
            isEnabled: order === id,
            label: getString(labelKey)?.t
        }
    })
    return (
        <Toggle
            labelId="charts.order"
            handleSelect={id => {
                setOrder(id as OrderOptions)
            }}
            items={items}
        />
    )
}

export default FacetHeading
