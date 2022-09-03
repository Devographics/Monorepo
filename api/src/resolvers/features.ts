import { getEntity } from '../entities'
import keys from '../data/keys.yml'
import { RequestContext, ResolverDynamicConfig } from '../types'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache
} from '../compute'

export default {
    FeatureExperience: {
        keys: () => keys.feature,
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
    Feature: {
        entity: async ({ id }: { id: string }) => {
            return await getEntity({ id })
        }
    }
}
