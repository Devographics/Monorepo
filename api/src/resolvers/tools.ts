import { computeToolsExperienceRankingYears, computeToolsExperienceRanking } from '../compute'
import { useCache } from '../caching'
import { Filters } from '../filters'
import keys from '../data/keys.yml'
import { RequestContext, ResolverDynamicConfig, SurveyConfig } from '../types'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache,
    getRawCommentsWithCache
} from '../compute'

export default {
    ToolsRankings: {
        years: async (
            { survey, ids, filters }: { survey: SurveyConfig; ids: string[]; filters?: Filters },
            args: any,
            context: RequestContext
        ) =>
            useCache({
                func: computeToolsExperienceRankingYears,
                context,
                funcOptions: { survey, tools: ids, filters }
            }),
        experience: async (
            { survey, ids, filters }: { survey: SurveyConfig; ids: string[]; filters?: Filters },
            args: any,
            context: RequestContext
        ) =>
            useCache({
                func: computeToolsExperienceRanking,
                context,
                funcOptions: { survey, tools: ids, filters }
            })
    },
    ToolExperience: {
        keys: () => keys.tool,
        all_years: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            args: any,
            context: RequestContext
        ) =>
            computeTermAggregationAllYearsWithCache({
                context,
                survey,
                key: `tools.${id}.experience`,
                options: {
                    ...options,
                    filters,
                    facet,
                    keys: keys.tool
                }
            }),
        year: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            { year }: { year: number },
            context: RequestContext
        ) =>
            computeTermAggregationSingleYearWithCache({
                context,
                survey,
                key: `tools.${id}.experience`,
                options: {
                    ...options,
                    filters,
                    year,
                    facet,
                    keys: keys.tool
                }
            })
    },
    ToolExperienceAggregated: {
        keys: () => keys.tool,
        all_years: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            args: any,
            context: RequestContext
        ) =>
            computeTermAggregationAllYearsWithCache({
                context,
                survey,
                key: `tools.${id}.experience`,
                options: {
                    ...options,
                    filters,
                    facet,
                    keys: keys.tool
                }
            }),
        year: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            { year }: { year: number },
            context: RequestContext
        ) =>
            computeTermAggregationSingleYearWithCache({
                context,
                survey,
                key: `tools.${id}.experience`,
                options: {
                    ...options,
                    filters,
                    year,
                    facet,
                    keys: keys.tool
                }
            })
    },
    Comments: {
        all_years: async ({ survey, id }: ResolverDynamicConfig, {}, context: RequestContext) =>
            await getRawCommentsWithCache({ survey, id, context, key: `tools.${id}.comment` }),
        year: async (
            { survey, id }: ResolverDynamicConfig,
            { year }: { year: number },
            context: RequestContext
        ) => await getRawCommentsWithCache({ survey, id, year, context, key: `tools.${id}.comment` })
    }
}
