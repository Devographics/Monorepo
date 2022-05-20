import { computeToolsExperienceRankingYears, computeToolsExperienceRanking } from '../compute'
import { useCache } from '../caching'
import keys from '../data/keys.yml'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache
} from '../compute'
import type { Resolvers } from '../generated/graphql'

export const ToolsRankings: Resolvers['ToolsRankings'] = {
    years: (
        { survey, ids, filters },
        args,
        { db }
    ) => useCache(computeToolsExperienceRankingYears, db, [survey, ids, filters]),
    experience: (
        { survey, ids, filters },
        args,
        { db }
    ) => useCache(computeToolsExperienceRanking, db, [survey, ids, filters])
}

export const ToolExperience: Resolvers['ToolExperience'] = {
    keys: () => keys.tool,
    all_years: (
        { survey, id, filters, options, facet },
        args,
        { db }
    ) =>
        computeTermAggregationAllYearsWithCache(db, survey, `tools.${id}.experience`, {
            ...options,
            filters,
            facet,
            keys: keys.tool
        }),
    year: (
        { survey, id, filters, options, facet },
        { year },
        { db }
    ) =>
        computeTermAggregationSingleYearWithCache(db, survey, `tools.${id}.experience`, {
            ...options,
            filters,
            year,
            facet,
            keys: keys.tool
        })
}

export const ToolExperienceAggregated: Resolvers['ToolExperienceAggregated'] = {
    keys: () => keys.tool,
    all_years: (
        { survey, id, filters, options, facet },
        args,
        { db }
    ) =>
        computeTermAggregationAllYearsWithCache(db, survey, `tools.${id}.experience`, {
            ...options,
            filters,
            facet,
            keys: keys.tool
        }),
    year: (
        { survey, id, filters, options, facet },
        { year },
        { db }
    ) =>
        computeTermAggregationSingleYearWithCache(db, survey, `tools.${id}.experience`, {
            ...options,
            filters,
            year,
            facet,
            keys: keys.tool
        })
}

