import { ResultsByYear } from 'core/types'

const valuesToRemove = ['previous_years', 'newsletter']

export default (data: ResultsByYear) => {
    if (data?.facets[0]?.buckets) {
        data.facets[0].buckets = data.facets[0].buckets.filter(
            ({ id }) => !valuesToRemove.includes(id.toString())
        )
    }
    return data
}
