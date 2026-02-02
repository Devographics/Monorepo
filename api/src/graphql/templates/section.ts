import { graphqlize } from '../../generate/helpers'
import {
    QuestionApiObject,
    SectionApiObject,
    EditionApiObject,
    SurveyApiObject,
    TypeDefTemplateOutput,
    TypeTypeEnum
} from '../../types'
import { getFeatureFieldTypeName } from '../../generate/templates/feature'
import { getToolFieldTypeName } from '../../generate/templates'
import { getFeaturesEnumTypeName } from './features_enum'
import { getToolsEnumTypeName } from './tools_enum'
import { CARDINALITIES_ID, ITEMS_ID } from '@devographics/constants'
import { isFeatureSection, isLibrarySection } from '../../helpers/sections'

/*

Sample output:

type Js2021UserInfoSection {
    age: StateOfJsAge
    years_of_experience: StateOfJsYearsOfExperience
    company_size: StateOfJsCompanySize
    yearly_salary: StateOfJsYearlySalary
    higher_education_degree: StateOfJsHigherEducationDegree
    # etc.
}

*/

export const getSectionTypeName = ({
    edition,
    section
}: {
    edition: EditionApiObject
    section: SectionApiObject
}) => `${graphqlize(edition.id)}${graphqlize(section.id)}Section`
export const generateSectionType = ({
    survey,
    edition,
    section,
    path
}: {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    path: string
}): TypeDefTemplateOutput => {
    const typeName = getSectionTypeName({ edition, section })

    // TODO: find better way to figure out if a section is a feature or tool section
    const isFeature = isFeatureSection(section)
    const isTool = isLibrarySection(section)

    const isFeatureOrToolSection = isFeature || isTool
    const featureOrToolTypeName = isFeature
        ? getFeatureFieldTypeName({ survey })
        : getToolFieldTypeName({ survey })

    const itemsTypeDef = isFeatureOrToolSection
        ? `"""
    Query all items included in this section at once.
    """
    ${ITEMS_ID}(itemIds:[${
              isFeature ? getFeaturesEnumTypeName(survey) : getToolsEnumTypeName(survey)
          }]): [${featureOrToolTypeName}]`
        : ''

    const cardinalitiesTypeDef = isFeatureOrToolSection
        ? `"""
    Get cardinalities data for this section (how many respondents used 1 item, how many used 2, etc.)
    """
    ${CARDINALITIES_ID}: [CardinalitiesItem]`
        : ''

    return {
        generatedBy: 'section',
        path,
        typeName,
        typeType: TypeTypeEnum.SECTION,
        /*

        Note: itemIds argument does not currently work because _items is 
        obtained through a property on the section, not its own resolver
        
        */
        typeDef: `type ${typeName} {
    ${itemsTypeDef}
    ${cardinalitiesTypeDef}
    ${
        section?.questions
            ? section.questions
                  .filter(q => q.hasApiEndpoint !== false)
                  .map((question: QuestionApiObject) => {
                      return question.typeValue || `${question.id}: ${question.fieldTypeName}`
                  })
                  .join('\n    ')
            : ''
    }
}`
    }
}
