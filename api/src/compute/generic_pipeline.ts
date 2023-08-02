import { generateFiltersQuery } from '../filters'
import { ComputeAxisParameters } from '../types'
import { NO_ANSWER } from '@devographics/constants'
// const NO_ANSWER = 'no_answer'
import { getDbPath } from './generic'
import { EditionMetadata, ResponsesTypes, SurveyMetadata } from '@devographics/types'
import { getPastEditions } from '../helpers/surveys'

export type PipelineProps = {
    surveyId: string
    selectedEditionId?: string
    filters?: any
    axis1: ComputeAxisParameters
    axis2?: ComputeAxisParameters | null
    showNoAnswer?: boolean
    responsesType?: ResponsesTypes
    survey: SurveyMetadata
    edition: EditionMetadata
}

// generate an aggregation pipeline for all years, or
// optionally restrict it to a specific year of data
export const getGenericPipeline = async (pipelineProps: PipelineProps) => {
    const {
        surveyId,
        selectedEditionId,
        filters,
        axis1,
        axis2,
        showNoAnswer = false,
        responsesType,
        survey,
        edition
    } = pipelineProps

    const axis1DbPath = getDbPath(axis1.question, responsesType)
    const axis2DbPath = axis2 && getDbPath(axis2.question, responsesType)

    if (!axis1DbPath) {
        throw new Error(`Could not find dbPath for question ${axis1.question.id}`)
    }

    let match: any = {
        surveyId: surveyId
        // [axis1DbPath]: { $nin: [null, '', [], {}] }
    }

    if (!showNoAnswer) {
        match[axis1DbPath] = { $nin: [null, '', [], {}] }
    }

    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath: axis1DbPath })
        match = { ...match, ...filtersQuery }
    }

    if (selectedEditionId) {
        // if edition is passed, restrict aggregation to specific edition
        match.editionId = selectedEditionId
    } else {
        // restrict aggregation to current and past editions, to avoid including results from the future
        const pastEditions = getPastEditions({ survey, edition })
        match.editionId = { $in: pastEditions.map(e => e.id) }
    }

    const pipeline: any[] = [
        {
            $match: match
        },
        {
            $set: {
                [`${axis1DbPath}`]: {
                    $cond: [
                        {
                            $and: [
                                { $not: [`$${axis1DbPath}`] },
                                {
                                    $ne: [`$${axis1DbPath}`, 0]
                                }
                            ]
                        },
                        NO_ANSWER,
                        `$${axis1DbPath}`
                    ]
                }
            }
        },
        {
            $unwind: {
                path: `$${axis1DbPath}`
            }
        },
        ...(axis2
            ? [
                  {
                      $set: {
                          [`${axis2DbPath}`]: {
                              $cond: [
                                  {
                                      $and: [
                                          { $not: [`$${axis2DbPath}`] },
                                          {
                                              $ne: [`$${axis2DbPath}`, 0]
                                          }
                                      ]
                                  },
                                  NO_ANSWER,
                                  `$${axis2DbPath}`
                              ]
                          }
                      }
                  }
              ]
            : []),
        ...(axis2
            ? [
                  {
                      $unwind: {
                          path: `$${axis2DbPath}`
                      }
                  }
              ]
            : []),
        {
            $group: {
                _id: {
                    editionId: '$editionId',
                    ...(axis2 && { [axis2.question.id]: `$${axis2DbPath}` }),
                    [axis1.question.id]: `$${axis1DbPath}`
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $group: {
                _id: {
                    editionId: '$_id.editionId',
                    ...(axis2 && { [axis2.question.id]: `$_id.${axis2.question.id}` })
                },
                facetBuckets: {
                    $push: {
                        id: `$_id.${axis1.question.id}`,
                        count: '$count'
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    editionId: '$_id.editionId'
                },
                buckets: {
                    $push: {
                        // type: axis2 ?? 'default',
                        id: axis2 ? `$_id.${axis2.question.id}` : 'default',
                        count: '$count',
                        facetBuckets: '$facetBuckets'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                editionId: `$_id.editionId`,
                buckets: 1
            }
        },
        { $sort: { editionId: 1 } }
    ]

    return pipeline
}
