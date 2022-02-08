import { ResultsByYear } from 'core/types'

const valuesToRemove = ['david_walsh', 'overreacted', 'kentcdodds']

export default (data: ResultsByYear) => {
    data.facets[0].buckets = data.facets[0].buckets.filter(
        ({ id }) => !valuesToRemove.includes(id.toString())
    )
    return data
}
