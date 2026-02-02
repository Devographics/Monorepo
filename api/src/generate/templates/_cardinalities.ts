import { ApiSectionTypes } from '@devographics/types'
import { getCardinalities } from '../../compute/cardinalities'
import { isFeatureSection } from '../../helpers/sections'
import { ApiTemplateFunction, ResolverParent, ResolverType } from '../../types/surveys'
import { getFeatureFieldTypeName } from './feature'
import { getToolFieldTypeName } from './tool'
import {
    ALL_FEATURES_SECTION,
    CARDINALITIES_ID,
    FEATURES_TYPE,
    TOOLS_TYPE
} from '@devographics/constants'

export const getCardinalitiesTypeValue = () => `"""
Get cardinalities data for this section (how many respondents used 1 item, how many used 2, etc.)
"""
${CARDINALITIES_ID}: [CardinalitiesItem]`

export const getCardinalitiesResolver = (type: ApiSectionTypes) => {
    const resolver: ResolverType = async data => {
        console.log('// cardinalities resolver')
        const { survey, edition, section, questionObjects } = data
        const cardinalities = await getCardinalities({
            survey,
            edition,
            section,
            type,
            questionObjects
        })
        return cardinalities
    }
    return resolver
}

export const _cardinalities: ApiTemplateFunction = ({ survey, edition, section, question }) => {
    // we need to use featureOrToolTypeName to leverage the responses resolver
    // defined for that type
    // TODO: make work with generic CardinalitiesItem type
    const isFeature = isFeatureSection(section) || section.id === ALL_FEATURES_SECTION
    const featureOrToolTypeName = isFeature
        ? getFeatureFieldTypeName({ survey })
        : getToolFieldTypeName({ survey })

    const type = isFeature ? FEATURES_TYPE : TOOLS_TYPE
    return {
        ...question,
        generatedBy: '_cardinalities',
        id: CARDINALITIES_ID,
        // typeValue: `${CARDINALITIES_ID}: [${featureOrToolTypeName}]`
        typeValue: getCardinalitiesTypeValue(),
        resolver: getCardinalitiesResolver(type)
    }
}
