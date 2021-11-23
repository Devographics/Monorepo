import { computeToolsExperienceRanking } from '../compute'
import { useCache } from '../caching'
import { Filters } from '../filters'
import keys from '../data/keys.yml'
import { RequestContext, ResolverDynamicConfig, SurveyConfig } from '../types'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache
} from '../compute'

export default {
    ToolsRankings: {
        experience: async (
            { survey, ids, filters }: { survey: SurveyConfig; ids: string[]; filters?: Filters },
            args: any,
            { db }: RequestContext
        ) => useCache(computeToolsExperienceRanking, db, [survey, ids, filters])
    },
    ToolExperience: {
        keys: () => keys.tool,
        all_years: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            args: any,
            { db }: RequestContext
        ) =>
            computeTermAggregationAllYearsWithCache(db, survey, `tools.${id}.experience`, {
                ...options,
                filters,
                facet
            }),
        year: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            { year }: { year: number },
            { db }: RequestContext
        ) =>
            computeTermAggregationSingleYearWithCache(db, survey, `tools.${id}.experience`, {
                ...options,
                filters,
                year,
                facet
            })
    }
}
