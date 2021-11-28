import _ from 'lodash'
import { Db } from 'mongodb'
import config from '../config'
import { SurveyConfig } from '../types'
import { Filters, generateFiltersQuery } from '../filters'

export async function computeChoicesOverYearsGraph(
    db: Db,
    survey: SurveyConfig,
    field: string,
    filters?: Filters
) {
    const collection = db.collection(config.mongo.normalized_collection)

    const results = await collection
        .aggregate<{
            years: Array<{
                year: number
                choice: string
            }>
        }>([
            {
                $match: generateFiltersQuery(filters)
            },
            // only extract the fields we're interested in
            {
                $project: {
                    _id: 0,
                    email: {
                        $trim: { input: '$user_info.email' }
                    },
                    year: true,
                    choice: `$${field}`
                }
            },
            // make sure we do not have empty/null values
            {
                $match: {
                    email: { $nin: [null, '', ' '] },
                    year: { $nin: [null, '', ' '] },
                    choice: { $nin: [null, '', ' '] }
                }
            },
            // make sure there is a single participation by year
            // if that's not the case, last answer will be used
            {
                $group: {
                    _id: {
                        email: '$email',
                        year: '$year'
                    },
                    email: { $last: '$email' },
                    year: { $last: '$year' },
                    choice: { $last: '$choice' }
                }
            },
            // make sure years are in order
            {
                $sort: {
                    email: 1,
                    year: 1
                }
            },
            // group results by email, and generate an array of responses by year
            {
                $group: {
                    _id: '$email',
                    yearCount: { $sum: 1 },
                    years: {
                        $push: {
                            year: '$year',
                            choice: '$choice'
                        }
                    }
                }
            },
            // exclude participation for a single year
            {
                $match: {
                    yearCount: {
                        $gt: 1
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    years: true
                }
            }
        ])
        .toArray()

    let nodes: Array<{
        id: string
        year: number
        choice: string
    }> = []
    let links: Array<{
        source: string
        target: string
        count: number
    }> = []

    await results.forEach(item => {
        item.years.forEach((current, index, arr) => {
            const currentId = `${current.year}.${current.choice}`
            if (nodes.find(n => n.id === currentId) === undefined) {
                nodes.push({
                    id: currentId,
                    ...current
                })
            }

            if (index > 0) {
                const previous = arr[index - 1]
                // make sure there's only one year between the 2 entries
                // otherwise, skip the link
                if (current.year - previous.year === 1) {
                    const previousId = `${previous.year}.${previous.choice}`
                    let link = links.find(l => {
                        return l.source === previousId && l.target === currentId
                    })
                    if (!link) {
                        link = {
                            source: previousId,
                            target: currentId,
                            count: 0
                        }
                        links.push(link)
                    }
                    link.count += 1
                }
            }
        })
    })

    nodes = _.orderBy(nodes, 'year')

    links = _.orderBy(links, 'count')
    links.reverse()

    return { nodes, links }
}
