import { fetchMdnResource } from '../external_apis'
import { Entity } from '../types'
import { getEntities } from '../entities'
import keys from '../data/keys.yml'
import {
    computeTermAggregationAllYearsWithCache,
    computeTermAggregationSingleYearWithCache
} from '../compute'
import type { Resolvers } from '../generated/graphql'

export const FeatureExperience: Resolvers['FeatureExperience'] = {
    keys: () => keys.feature,
    all_years: (
        { survey, id, filters, options, facet },
        args,
        { db }
    ) =>
        computeTermAggregationAllYearsWithCache(db, survey, `features.${id}.experience`, {
            ...options,
            filters,
            facet
        }),
    year: (
        { survey, id, filters, options, facet },
        { year },
        { db }
    ) =>
        computeTermAggregationSingleYearWithCache(db, survey, `features.${id}.experience`, {
            ...options,
            filters,
            year,
            facet
        })
}

export const Feature: Resolvers['Feature'] = {
    entity: async ({ id }) => {
        const features = await getEntities({ tag: 'features' })
        const feature = features.find((f: Entity) => f.id === id)
        return feature
    },
    name: async ({ id }) => {
        const features = await getEntities({ tag: 'features' })
        const feature = features.find((f: Entity) => f.id === id)
        return feature && feature.name
    },
    mdn: async ({ id }) => {
        const features = await getEntities({ tag: 'features' })
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
