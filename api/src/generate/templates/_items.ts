import { getEditionToolsFeaturesResolverMap, getItems } from '../resolvers'
import { ApiTemplateFunction, ResolverMap, ResolverParent } from '../../types/surveys'
import { getFeatureFieldTypeName } from './feature'
import { ALL_FEATURES_SECTION, FEATURES_TYPE, ITEMS_ID, TOOLS_TYPE } from '@devographics/constants'
import { getFeaturesEnumTypeName } from '../../graphql/templates/features_enum'
import { getToolsEnumTypeName } from '../../graphql/templates/tools_enum'
import { getToolFieldTypeName } from './tool'
import { isFeatureSection } from '../../helpers/sections'

export const _items: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    const isFeature = isFeatureSection(section) || section.id === ALL_FEATURES_SECTION
    const featureOrToolTypeName = isFeature
        ? getFeatureFieldTypeName({ survey })
        : getToolFieldTypeName({ survey })
    const enumTypeName = isFeature ? getFeaturesEnumTypeName(survey) : getToolsEnumTypeName(survey)

    const resolver = (data: ResolverParent) => {
        console.log('// _items resolver')
    }

    return {
        ...question,
        generatedBy: '_items',
        id: ITEMS_ID,
        typeValue: `${ITEMS_ID}(itemIds:[${enumTypeName}]): [${featureOrToolTypeName}]`,
        resolver
        // resolverMap: getEditionToolsFeaturesResolverMap(isFeature ? FEATURES_TYPE : TOOLS_TYPE)
    }
}
