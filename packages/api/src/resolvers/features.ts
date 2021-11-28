import { fetchMdnResource } from '../external_apis'
import { Entity } from '../types'
import { getEntities } from '../entities'
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
            { db }: RequestContext
        ) =>
            computeTermAggregationAllYearsWithCache(db, survey, `features.${id}.experience`, {
                ...options,
                filters,
                facet
            }),
        year: async (
            { survey, id, filters, options, facet }: ResolverDynamicConfig,
            { year }: { year: number },
            { db }: RequestContext
        ) =>
            computeTermAggregationSingleYearWithCache(db, survey, `features.${id}.experience`, {
                ...options,
                filters,
                year,
                facet
            })
    },
    Feature: {
        name: async ({ id }: { id: string }) => {
            const features = await getEntities({ tag: 'feature' })
            const feature = features.find((f: Entity) => f.id === id)

            return feature && feature.name
        },
        mdn: async ({ id }: { id: string }) => {
            const features = await getEntities({ tag: 'feature' })
            const feature = features.find((f: Entity) => f.id === id)
            if (!feature || !feature.mdn) {
                return
            }

            const mdn = await fetchMdnResource(feature.mdn)

            if (mdn) {
                return mdn.find(t => t.locale === 'en-US')
            } else {
                return
            }
        }
    }
}
