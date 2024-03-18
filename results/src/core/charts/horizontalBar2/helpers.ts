// import { useState } from 'react'
// import './HorizontalBar.scss'

// import {
//     Bucket,
//     FacetBucket,
//     FeaturesOptions,
//     QuestionMetadata,
//     ResponseData,
//     ResultsSubFieldEnum,
//     SimplifiedSentimentOptions
// } from '@devographics/types'
// import { ColumnModes, OrderOptions } from '../common2/types'
// import { ChartState, Control, Views } from './types'
// import { Bars, Boxplot } from 'core/icons'
// import { HorizontalBarBlock2Props } from './HorizontalBarBlock'
// import { ChartValues } from '../multiItemsExperience/types'
// import max from 'lodash/max'
// import charts from 'core/theme/charts'
// import { BoxPlotRow, FacetRow, SingleBarRow } from './HorizontalBarRow'
// import { FacetItem } from 'core/filters/types'
// import { useTheme } from 'styled-components'
// import { BlockDefinition } from 'core/types'
// import { useAllQuestionsWithOptions } from '../hooks'

// export const sortOptions = {
//     experience: Object.values(FeaturesOptions),
//     sentiment: Object.values(SimplifiedSentimentOptions)
// }

// export const getChartCurrentEdition = ({
//     data,
//     series,
//     block
// }: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
//     const subField = block?.queryOptions?.subField || ResultsSubFieldEnum.RESPONSES
//     // TODO: ideally blocks should always receive either a single series, or an array of series
//     const defaultSeries = data || series[0].data
//     const { currentEdition } = defaultSeries[subField] as ResponseData
//     return currentEdition
// }

// export const getChartCompletion = ({
//     data,
//     series,
//     block
// }: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
//     const currentEdition = getChartCurrentEdition({ data, series, block })
//     return currentEdition.completion
// }
// export const getChartBuckets = ({
//     data,
//     series,
//     block
// }: Pick<HorizontalBarBlock2Props, 'data' | 'series' | 'block'>) => {
//     const currentEdition = getChartCurrentEdition({ data, series, block })
//     return currentEdition.buckets
// }

// const controlIcons = {
//     [Views.BOXPLOT]: Boxplot,
//     [Views.AVERAGE]: Bars,
//     [Views.COUNT]: Bars,
//     [Views.PERCENTAGE_BUCKET]: Bars,
//     [Views.PERCENTAGE_QUESTION]: Bars
// }

// export const getControls = ({
//     chartState,
//     chartValues
// }: {
//     chartState: ChartState
//     chartValues: ChartValues
// }) => {
//     const { view, setView } = chartState
//     const { facetQuestion } = chartValues
//     const views = facetQuestion
//         ? facetQuestion.optionsAreSequential
//             ? [Views.BOXPLOT, Views.AVERAGE, Views.PERCENTAGE_BUCKET, Views.COUNT]
//             : [Views.PERCENTAGE_BUCKET, Views.COUNT]
//         : [Views.PERCENTAGE_QUESTION, Views.COUNT]
//     const controls: Control[] = views.map(id => ({
//         id,
//         labelId: `chart_units.${id}`,
//         isChecked: view === id,
//         icon: controlIcons[id],
//         onClick: e => {
//             e.preventDefault()
//             setView(id)
//         }
//     }))
//     return controls
// }

// export const getValue = (bucket: Bucket | FacetBucket, chartState: ChartState) => {
//     const { view } = chartState
//     const { count, percentageBucket, percentageQuestion, averageByFacet } = bucket
//     switch (view) {
//         case Views.AVERAGE:
//             return averageByFacet || 0
//         case Views.BOXPLOT:
//             return 999 || 0
//         case Views.PERCENTAGE_BUCKET:
//             return percentageBucket || 1
//         case Views.PERCENTAGE_QUESTION:
//             return percentageQuestion || 0
//         case Views.COUNT:
//             return count || 0
//     }
// }

// // export const useColor = ({
// //     facetId,
// //     cellId,
// //     facetOptionsAreSequential,
// //     cellIndex
// // }: {
// //     facetId?: string
// //     cellId: string
// //     facetOptionsAreSequential: boolean
// //     cellIndex: number
// // }) => {
// //     const theme = useTheme()
// //     const chartScale = facetId && theme?.colors?.ranges?.[facetId]
// //     if (chartScale?.[cellId]) {
// //         return chartScale[cellId][0]
// //     } else {
// //         if (facetOptionsAreSequential) {
// //             return theme.colors.velocity[cellIndex]
// //         } else {
// //             return theme.colors.distinct[cellIndex]
// //         }
// //     }
// // }

// export const getIsPercentage = (chartState: ChartState) =>
//     [Views.PERCENTAGE_BUCKET, Views.PERCENTAGE_QUESTION].includes(chartState.view)

// export const getRowComponent = (bucket: Bucket, chartState: ChartState) => {
//     const { view } = chartState
//     const { facetBuckets } = bucket
//     const hasFacetBuckets = facetBuckets && facetBuckets.length > 0
//     if (hasFacetBuckets) {
//         if (view === Views.BOXPLOT) {
//             return BoxPlotRow
//         } else if (view === Views.PERCENTAGE_BUCKET) {
//             return FacetRow
//         } else {
//             return SingleBarRow
//         }
//     } else {
//         return SingleBarRow
//     }
// }

// export const useQuestionMetadata = (facet?: FacetItem) => {
//     if (!facet) return
//     const { id, sectionId } = facet
//     const allQuestions = useAllQuestionsWithOptions()
//     const question = allQuestions.find(q => q.id === id && q.sectionId === sectionId)
//     return question
// }
