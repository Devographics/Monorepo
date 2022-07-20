import { Db } from 'mongodb'
import { useCache } from '../caching'
import { computeTermAggregationAllYears } from '../compute'
import { getOtherKey } from '../helpers'
import { RequestContext, SurveyConfig } from '../types'
import { Filters } from '../filters'
import { Entity } from '../types'
import { getEntities } from '../entities'
import { YearAggregations } from '../compute/generic'

interface OtherFeaturesConfig {
    survey: SurveyConfig
    id: string
    filters?: Filters
}

const computeOtherFeatures = async (
    context: RequestContext,
    survey: SurveyConfig,
    id: string,
    filters?: Filters
) => {
    const features = await getEntities({ tag: 'feature'})

    const otherFeaturesByYear = await useCache(computeTermAggregationAllYears, context, [
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

export default {
    OtherFeatures: {
        all_years: async (
            { survey, id, filters }: OtherFeaturesConfig,
            args: any,
            context: RequestContext
        ) => computeOtherFeatures(context, survey, id, filters),
        year: async (
            { survey, id, filters }: OtherFeaturesConfig,
            { year }: { year: number },
            context: RequestContext
        ) => {
            const allYears = await computeOtherFeatures(context, survey, id, filters)
            return allYears.find((yearItem: YearAggregations) => yearItem.year === year)
        }
    }
}
