import { getCardinalities } from '../../compute/cardinalities'
import { isFeatureSection } from '../../helpers/sections'
import { ApiTemplateFunction, ResolverParent } from '../../types/surveys'
import { getFeatureFieldTypeName } from './feature'
import { getToolFieldTypeName } from './tool'
import {
    ALL_FEATURES_SECTION,
    CARDINALITIES_ID,
    FEATURES_TYPE,
    TOOLS_TYPE
} from '@devographics/constants'

export const _cardinalities: ApiTemplateFunction = ({
    survey,
    edition,
    section,
    question,
    context
}) => {
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
        typeValue: `${CARDINALITIES_ID}: [CardinalitiesItem]`,
        resolver: async data => {
            const { survey, edition, section, questionObjects } = data
            const cardinalities = await getCardinalities({
                survey,
                edition,
                section,
                type,
                questionObjects,
                context: {}
            })
            return cardinalities
        }
    }
}
