import { Db } from 'mongodb'
import { useCache } from '../caching'
import { computeTermAggregationAllYears } from '../compute'
import { getOtherKey } from '../helpers'
import { SurveyConfig } from '../types'
import { Filters } from '../filters'
import { Entity } from '../types'
import { getEntities } from '../entities'
import { YearAggregations } from '../compute'
import type { Resolvers } from '../generated/graphql'

interface OtherFeaturesConfig {
    survey: SurveyConfig
    id: string
    filters?: Filters
}

const computeOtherFeatures = async (
    db: Db,
    survey: SurveyConfig,
    id: string,
    filters?: Filters
) => {
    const features = await getEntities({ tag: 'feature' })

    const otherFeaturesByYear = await useCache(computeTermAggregationAllYears, db, [
        survey,
        `features_others.${getOtherKey(id)}`,
        { filters }
    ])

    return otherFeaturesByYear.map((yearOtherFeatures: YearAggregations) => {
        return {
            ...yearOtherFeatures,
            buckets: yearOtherFeatures.buckets.map(bucket => {
                const feature = features.find((f: Entity) => f.id === bucket.id)

                return {
                    ...bucket,
                    name: feature ? feature.name : bucket.id
                }
            })
        }
    })
}

export const OtherFeatures: Resolvers['OtherFeatures'] = {
    all_years: (
        { survey, id, filters },
        args,
        { db }
    ) => computeOtherFeatures(db, survey, id, filters),
    year: async (
        { survey, id, filters },
        { year },
        { db }
    ) => {
        const allYears = await computeOtherFeatures(db, survey, id, filters)
        return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
    }
}
