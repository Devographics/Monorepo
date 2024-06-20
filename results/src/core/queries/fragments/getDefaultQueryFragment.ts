import { QueryOptions, SeriesParams } from '../types'
import { getSerieFragment } from './getSerieFragment'

export const getDefaultQueryFragment = ({
    queryOptions,
    series
}: {
    queryOptions: QueryOptions
    series: SeriesParams[]
}) => {
    const { surveyId, editionId, sectionId } = queryOptions

    return `
query {
    surveys {
    ${surveyId} {
        ${editionId} {
        ${sectionId} {
            ${series.map(serie => getSerieFragment({ queryOptions, serie }))}
        }
        }
    }
    }
}
`
}
