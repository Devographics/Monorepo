import { generateFiltersQuery } from '../filters'
import { ParsedQuestion } from '../types'

export type PipelineProps = {
    survey: string
    dbPath: string
    facetQuestion?: ParsedQuestion
    questionId: string
    editionId?: string
    filters?: any
    limit: number
    match?: any
    cutoff?: number
}

// generate an aggregation pipeline for all years, or
// optionally restrict it to a specific year of data
export const getGenericPipeline = async (pipelineProps: PipelineProps) => {
    const {
        survey,
        filters,
        dbPath,
        facetQuestion,
        questionId,
        editionId,
        limit,
        cutoff = 1
    } = pipelineProps

    const facetPath = facetQuestion?.dbPath

    let match: any = {
        survey,
        [dbPath]: { $nin: [null, '', [], {}] }
    }

    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath })
        match = { ...match, ...filtersQuery }
    }

    // if year is passed, restrict aggregation to specific year
    if (editionId) {
        match.surveySlug = editionId
    }

    const pipeline: any[] = [
        {
            $match: match
        },
        // { $count: 'questionRespondents' },
        {
            $unwind: {
                path: `$${dbPath}`
            }
        },
        ...(facetPath
            ? [
                  {
                      $unwind: {
                          path: `$${facetPath}`
                      }
                  }
              ]
            : []),
        {
            $group: {
                _id: {
                    editionId: '$surveySlug',
                    ...(facetQuestion && { [facetQuestion.id]: `$${facetPath}` }),
                    [questionId]: `$${dbPath}`
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
                    ...(facetQuestion && { [facetQuestion.id]: `$_id.${facetQuestion.id}` })
                },
                buckets: {
                    $push: {
                        id: `$_id.${questionId}`,
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
                facets: {
                    $push: {
                        type: facetQuestion?.id ?? 'default',
                        id: facetQuestion ? `$_id.${facetQuestion.id}` : 'default',
                        count: '$count',
                        buckets: '$buckets'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                editionId: `$_id.editionId`,
                facets: 1
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
