import { getEditionToolsFeaturesResolverMap, getItems } from '../resolvers'
import { ApiTemplateFunction, ResolverMap, ResolverParent, ResolverType } from '../../types/surveys'
import { getFeatureFieldTypeName } from './feature'
import { ALL_FEATURES_SECTION, FEATURES_TYPE, ITEMS_ID, TOOLS_TYPE } from '@devographics/constants'
import { getFeaturesEnumTypeName } from '../../graphql/templates/features_enum'
import { getToolsEnumTypeName } from '../../graphql/templates/tools_enum'
import { getToolFieldTypeName } from './tool'
import { isFeatureSection } from '../../helpers/sections'
import { ApiSectionTypes } from '@devographics/types'
import { RequestContext } from '../../types'

export const getItemsTypeValue = (enumTypeName: string, featureOrToolTypeName: string) =>
    `"""
Query all items included in this section at once.
"""
${ITEMS_ID}(itemIds:[${enumTypeName}]): [${featureOrToolTypeName}]`

export const getItemsResolver = (type: ApiSectionTypes, context: RequestContext) => {
    const resolver: ResolverType = async (data: ResolverParent) => {
        console.log('// _items resolver')
        const { survey, edition, section } = data
        const items = await getItems({
            survey,
            edition,
            section,
            type,
            context
        })
        return items
    }
    return resolver
}

export const _items: ApiTemplateFunction = ({ survey, edition, section, question, context }) => {
    const isFeature = isFeatureSection(section) || section.id === ALL_FEATURES_SECTION
    const featureOrToolTypeName = isFeature
        ? getFeatureFieldTypeName({ survey })
        : getToolFieldTypeName({ survey })
    const enumTypeName = isFeature ? getFeaturesEnumTypeName(survey) : getToolsEnumTypeName(survey)

    const type = isFeature ? FEATURES_TYPE : TOOLS_TYPE

    return {
        ...question,
        generatedBy: '_items',
        id: ITEMS_ID,
        typeValue: getItemsTypeValue(enumTypeName, featureOrToolTypeName),
        resolver: getItemsResolver(type, context)
        // resolverMap: getEditionToolsFeaturesResolverMap(isFeature ? FEATURES_TYPE : TOOLS_TYPE)
    }
}
