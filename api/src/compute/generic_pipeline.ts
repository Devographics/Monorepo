import { generateFiltersQuery } from '../filters'
import { getFacetPath } from '../helpers'

export type PipelineProps = {
    survey: string
    key: string
    facet?: string
    fieldId: string
    year?: number
    filters?: any
    limit: number
    match?: any
    cutoff?: number
}


// generate an aggregation pipeline for all years, or
// optionally restrict it to a specific year of data
export const getGenericPipeline = (pipelineProps: PipelineProps) => {
    const { survey, filters, key, facet, fieldId, year, limit, cutoff = 1 } = pipelineProps

    const facetPath = facet && getFacetPath(facet)

    const match: any = {
        survey,
        [key]: { $nin: [null, '', []] },
        ...generateFiltersQuery(filters)
    }

    // if year is passed, restrict aggregation to specific year
    if (year) {
        match.year = year
    }

    const pipeline: any[] = [
        {
            $match: match
        },
        // { $count: 'questionRespondents' },
        {
            $unwind: {
                path: `$${key}`
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
                    year: '$year',
                    ...(facet && { [facet]: `$${facetPath}` }),
                    [fieldId]: `$${key}`
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $group: {
                _id: {
                    year: '$_id.year',
                    ...(facet && { [facet]: `$_id.${facet}` })
                },
                buckets: {
                    $push: {
                        id: `$_id.${fieldId}`,
                        count: '$count'
                    }
                }
            }
        },
        {
            $group: {
                _id: {
                    year: '$_id.year'
                },
                facets: {
                    $push: {
                        type: facet ?? 'default',
                        id: facet ? `$_id.${facet}` : 'default',
                        count: '$count',
                        buckets: '$buckets'
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                year: `$_id.year`,
                facets: 1
            }
        },
        { $sort: { year: 1 } }
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
