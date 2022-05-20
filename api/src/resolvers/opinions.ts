import { getDynamicResolvers } from '../helpers'
import { computeOpinionByYear } from '../compute/opinions'
import { useCache } from '../caching'
import { YearAggregations } from '../compute'
import keys from '../data/keys.yml'
import type { Resolvers } from '../generated/graphql'

export const Opinion: Resolvers['Opinion'] = {
    keys: () => keys.opinions,
    all_years: (
        { survey, id, filters },
        args,
        { db }
    ) => useCache(computeOpinionByYear, db, [survey, id, filters]),
    year: async (
        { survey, id, filters },
        { year },
        { db }
    ) => {
        const allYears = await useCache(computeOpinionByYear, db, [survey, id, filters])
        return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
    }
}

export const OtherOpinions: Resolvers['OtherOpinions'] = getDynamicResolvers(id => `opinions_others.${id}.others.normalized`, {
    sort: { property: 'id', order: 'asc' }
})
