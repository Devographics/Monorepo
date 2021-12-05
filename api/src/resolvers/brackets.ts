import { getDynamicResolvers } from '../helpers'
import { winsAggregationFunction, matchupsAggregationFunction } from '../compute/brackets'
import keys from '../data/keys.yml'

export default {
    BracketWins: {
        keys: () => keys.bracket,
        ...getDynamicResolvers(
            id => {
                const fullPath = id.replace('__', '.')
                return fullPath
            },
            {},
            winsAggregationFunction
        )
    },

    BracketMatchups: getDynamicResolvers(
        id => {
            const fullPath = id.replace('__', '.')
            return fullPath
        },
        {},
        matchupsAggregationFunction
    )
}
