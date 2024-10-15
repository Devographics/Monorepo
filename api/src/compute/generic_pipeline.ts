import { generateFiltersQuery } from '../filters'
import { ComputeAxisParameters, GenericComputeParameters } from '../types'
import { NO_ANSWER } from '@devographics/constants'
import { getDbPath } from './generic'
import { EditionMetadata, ResponsesTypes, SurveyMetadata } from '@devographics/types'
import { getPastEditions } from '../helpers/surveys'

export interface PipelineProps extends GenericComputeParameters {
    surveyId: string
    selectedEditionId?: string
    filters?: any
    axis1: ComputeAxisParameters
    axis2?: ComputeAxisParameters | null
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

    /*

    TODO: currently we can't specify the subfield for a facet. In other words we can only facet
    by main responses values, not by freeform values.

    For that reason, if two axes are specified, hardcode axis 1's subfield to be "responses"
    (axis 1 is actually the second axis, they're inverted for whatever reason)

    */
    const responseType1 = axis2 ? ResponsesTypes.RESPONSES : responsesType
    const axis1DbPath = getDbPath(axis1.question, responseType1)
    const axis1Id = axis1.question.id

    const axis2DbPath = axis2 && getDbPath(axis2.question, responsesType)
    const axis2Id = axis2?.question.id

    if (!axis1DbPath) {
        throw new Error(`Could not find dbPath for question ${axis1Id}`)
    }

    let match: any = {
        surveyId: surveyId
        // [axis1DbPath]: { $nin: [null, '', [], {}] }
    }

    if (!showNoAnswer) {
        match[axis1DbPath] = { $nin: [null, '', [], {}] }
        if (axis2DbPath) {
            match[axis2DbPath] = { $nin: [null, '', [], {}] }
        }
    }

    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath: axis1DbPath, surveyId })
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
        /*
        
        Stage 1
        
        Match surveyId and editionId

        */
        {
            $match: match
        },
        /*
        
        Stage 2
        
        Use $set to replace field with NO_ANSWER if empty (or leave it untouched if not empty)

        */
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
        /*

        Stage 3

        In case question accepts multiple answers and field is an array, 
        unwind it to create separate documents for each selected option.

        If not an array, this will not do anything.

        */
        {
            $unwind: {
                path: `$${axis1DbPath}`
            }
        },
        /*

        Stage 4 (optional)

        Same as Stage 2, but for axis2

        */
        ...(axis2DbPath
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
        /*

        Stage 5 (optional)

        Same as Stage 3, but for axis2. 

        */
        ...(axis2DbPath
            ? [
                  {
                      $unwind: {
                          path: `$${axis2DbPath}`
                      }
                  }
              ]
            : []),
        /*

        Stage 6

        Group all items with the same axis1 (and optionally axis2) value and calculate their sum
        using the `count` field as accumulator

        */
        {
            $group: {
                _id: {
                    editionId: '$editionId',
                    [axis1Id]: `$${axis1DbPath}`,
                    ...(axis2DbPath && axis2Id && { [axis2Id]: `$${axis2DbPath}` })
                },
                count: {
                    $sum: 1
                }
            }
        },
        /*

        Stage 7

        Group into facetBuckets

        */
        {
            $group: {
                _id: {
                    editionId: '$_id.editionId',
                    ...(axis2Id && { [axis2Id]: `$_id.${axis2Id}` })
                },
                facetBuckets: {
                    $push: {
                        id: `$_id.${axis1Id}`,
                        count: '$count'
                    }
                }
            }
        },
        /*

        Stage 8

        Group into buckets
        
        */
        {
            $group: {
                _id: {
                    editionId: '$_id.editionId'
                },
                buckets: {
                    $push: {
                        // type: axis2 ?? 'default',
                        id: axis2Id ? `$_id.${axis2Id}` : 'default',
                        count: '$count',
                        facetBuckets: '$facetBuckets'
                    }
                }
            }
        },
        /*

        Stage 9

        Discard _id, keep buckets, and create editionId 

        */
        {
            $project: {
                _id: 0,
                editionId: `$_id.editionId`,
                buckets: 1
            }
        },
        /*

        Stage 10

        Sort by editionId to get older editions first
        
        */
        { $sort: { editionId: 1 } }
    ]

    return pipeline
}
