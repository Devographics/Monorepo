import { computeHappinessByYear } from '../compute'
import { useCache } from '../caching'
import { YearAggregations } from '../compute'
import keys from '../data/keys.yml'
import type { Resolvers } from '../generated/graphql'

export const Happiness: Resolvers['Happiness'] = {
    keys: () => keys.happiness,
    all_years: (
        { survey, id, filters },
        args,
        { db }
    ) => useCache(computeHappinessByYear, db, [survey, id, filters]),
    year: async (
        { survey, id, filters },
        { year },
        { db }
    ) => {
        const allYears = await useCache(computeHappinessByYear, db, [survey, id, filters])
        return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
    }
}
