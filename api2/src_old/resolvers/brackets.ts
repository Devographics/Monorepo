import { getDynamicResolvers } from '../helpers'
import { winsAggregationFunction, matchupsAggregationFunction } from '../compute/brackets'
import { getChartKeys } from '../helpers'

export default {
    BracketWins: {
        keys: () => getChartKeys('bracket'),
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
