import { getDynamicResolvers } from '../helpers'
import { winsAggregationFunction, matchupsAggregationFunction } from '../compute/brackets'

export default {
    BracketWins: getDynamicResolvers(
        id => {
            const fullPath = id.replace('__', '.')
            return fullPath
        },
        {},
        winsAggregationFunction
    ),

    BracketMatchups: getDynamicResolvers(
        id => {
            const fullPath = id.replace('__', '.')
            return fullPath
        },
        {},
        matchupsAggregationFunction
    )
}
