import { generateFiltersQuery } from '../filters'
import { ComputeAxisParameters } from '../types'

export type PipelineProps = {
    surveyId: string
    selectedEditionId?: string
    filters?: any
    axis1: ComputeAxisParameters
    axis2?: ComputeAxisParameters | null
}

// generate an aggregation pipeline for all years, or
// optionally restrict it to a specific year of data
export const getGenericPipeline = async (pipelineProps: PipelineProps) => {
    const { surveyId, selectedEditionId, filters, axis1, axis2 } = pipelineProps

    const axis1DbPath = axis1?.question.dbPath
    const axis2DbPath = axis2?.question.dbPath

    if (!axis1DbPath) {
        throw new Error(`Could not find dbPath for question ${axis1.question.id}`)
    }

    let match: any = {
        survey: surveyId,
        [axis1DbPath]: { $nin: [null, '', [], {}] }
    }

    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath: axis1DbPath })
        match = { ...match, ...filtersQuery }
    }

    // if year is passed, restrict aggregation to specific year
    if (selectedEditionId) {
        match.surveySlug = selectedEditionId
    }

    const pipeline: any[] = [
        {
            $match: match
        },
        // { $count: 'questionRespondents' },
        {
            $unwind: {
                path: `$${axis1DbPath}`
            }
        },
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
                    editionId: '$surveySlug',
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
                        // facetId: axis2?.question?.id ?? 'default',
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

    // if (cutoff) {
    //     pipeline.push({ $match: { count: { $gt: cutoff } } })
    // }

    // only add limit if year is specified
    // if (year) {
    //     pipeline.push({ $limit: limit })
    // }

    return pipeline
}
