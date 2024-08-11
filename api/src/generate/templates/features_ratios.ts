import {
    ApiTemplateFunction,
    EditionApiObject,
    ResolverMap,
    SectionApiObject
} from '../../types/surveys'
import { graphqlize } from '../helpers'
import { computeKey, useCache } from '../../helpers/caching'
import { applyRankCutoff, computeExperienceRatios, metrics } from '../../compute/experience'
import { getFeaturesEnumTypeName } from '../../graphql/templates/features_enum'

const getSectionFeaturesIds = (section: SectionApiObject) => {
    const sectionFeatures = section.questions.filter(q => q.template === 'feature')
    const features = sectionFeatures.map(q => q.id)
    return features
}

const getEditionFeaturesIds = (edition: EditionApiObject) => {
    return edition.sections.map(s => getSectionFeaturesIds(s)).flat()
}

const getResolverMap = (): ResolverMap => ({
    items: async (parent, args, context, info) => {
        const { survey, edition, section, question } = parent
        const { itemIds: itemIds_, filters, parameters = {} } = args
        const { enableCache, years, rankCutoff } = parameters

        const itemIds = itemIds_ || getEditionFeaturesIds(edition)
        const type = 'feature'
        const funcOptions = { survey, itemIds, type, years, filters, context }

        const key = computeKey(computeExperienceRatios, {
            editionId: edition.id,
            questionId: question.id,
            itemIds: itemIds_ || 'allItems',
            years: years || 'allYears',
            filters
        })

        const results = await useCache({
            key,
            func: computeExperienceRatios,
            context,
            funcOptions,
            enableCache
        })

        // note: we do this here to avoid generating different cache keys for different
        // cutoff points, since we have to calculate data for all items anyway no matter the cutoff
        return applyRankCutoff(results, rankCutoff)
    },
    ids: ({ section, edition }, { itemIds }) => {
        return itemIds || getEditionFeaturesIds(edition)
    },
    years: ({ survey }) => {
        return survey.editions.map(e => e.year)
    }
})

/*

TODO

This should instead follow the same structure as the other fields, e.g.

features
  features_ratios
    items <parameters go here>
      years
      ids  
      all_editions

So that `years` and `ids` can also know about the parameters

*/
export const features_ratios: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const fieldTypeName = `${graphqlize(survey.id)}${graphqlize(edition.id)}FeaturesRatios`
    const featuresEnumTypeName = getFeaturesEnumTypeName(survey)
    return {
        ...question,
        id: `features_ratios`,
        generatedBy: 'features_ratios',
        fieldTypeName,
        typeDef: `type ${fieldTypeName} {
            ids: [String]
            years: [Int]
            items(itemIds: [${featuresEnumTypeName}], parameters: FeaturesRatiosParameters, filters: ${graphqlize(
            survey.id
        )}Filters): [FeatureRatiosItemData]
        }`,
        resolverMap: getResolverMap()
    }
}
