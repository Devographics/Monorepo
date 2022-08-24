import { fetchMdnResource } from '../external_apis'
import { Entity } from '../types'
import { getEntities } from '../entities'
import keys from '../data/keys.yml'
import { RequestContext, ResolverDynamicConfig } from '../types'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache
} from '../compute'
import { useCache } from '../caching'

export default {
    FeatureExperience: {
        keys: () => keys.feature,
        all_years: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            args: any,
            context: RequestContext
        ) =>
            computeTermAggregationAllYearsWithCache(context, survey, `features.${id}.experience`, {
                ...options,
                filters,
                facet
            }),
        year: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            { year }: { year: number },
            context: RequestContext
        ) =>
            computeTermAggregationSingleYearWithCache(
                context,
                survey,
                `features.${id}.experience`,
                {
                    ...options,
                    filters,
                    year,
                    facet
                }
            )
    },
    Feature: {
        entity: async ({ id }: { id: string }) => {
            const features = await getEntities({ tag: 'features' })
            const feature = features.find((f: Entity) => f.id === id)
            return feature
        },
        name: async ({ id }: { id: string }) => {
            const features = await getEntities({ tag: 'features' })
            const feature = features.find((f: Entity) => f.id === id)
            return feature && feature.name
        },
        mdn: async ({ id }: { id: string }, {}, context: RequestContext) => {
            const features = await getEntities({ tag: 'features' })
            const feature = features.find((f: Entity) => f.id === id)
            if (!feature || !feature.mdn) {
                return
            }

            const mdn = await useCache(fetchMdnResource, context, [feature.mdn])

            if (mdn) {
                return mdn.find(t => t.locale === 'en-US')
            } else {
                return
            }
        }
    }
}
