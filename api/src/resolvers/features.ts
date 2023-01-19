import { getEntity } from '../entities'
import { getChartKeys } from '../helpers'
import { RequestContext, ResolverDynamicConfig } from '../types'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache,
    getRawCommentsWithCache
} from '../compute'

export default {
    FeatureExperience: {
        keys: () => getChartKeys('feature'),
        all_years: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            args: any,
            context: RequestContext
        ) =>
            computeTermAggregationAllYearsWithCache({
                context,
                survey,
                key: `features.${id}.experience`,
                options: {
                    ...options,
                    filters,
                    facet
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
                key: `features.${id}.experience`,
                options: {
                    ...options,
                    filters,
                    year,
                    facet
                }
            })
    },
    FeatureComments: {
        all_years: async ({ survey, id }: ResolverDynamicConfig, {}, context: RequestContext) =>
            await getRawCommentsWithCache({ survey, id, context, key: `features.${id}.comment` }),
        year: async (
            { survey, id }: ResolverDynamicConfig,
            { year }: { year: number },
            context: RequestContext
        ) => await getRawCommentsWithCache({ survey, id, year, context, key: `features.${id}.comment` })
    },
    Feature: {
        entity: async ({ id }: { id: string }) => {
            return await getEntity({ id })
        }
    }
}
