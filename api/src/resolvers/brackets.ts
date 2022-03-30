import { getDynamicResolvers } from '../helpers'
import { winsAggregationFunction, matchupsAggregationFunction } from '../compute/brackets'
import keys from '../data/keys.yml'
import type { Resolvers } from '../generated/graphql'

export const BracketWins: Resolvers['BracketWins'] = {
    keys: () => keys.bracket,
    ...getDynamicResolvers(
        id => {
            const fullPath = id.replace('__', '.')
            return fullPath
        },
        {},
        winsAggregationFunction
    )
}

export const BracketMatchups: Resolvers['BracketMatchups'] = getDynamicResolvers(
    id => {
        const fullPath = id.replace('__', '.')
        return fullPath
    },
    {},
    matchupsAggregationFunction
)
