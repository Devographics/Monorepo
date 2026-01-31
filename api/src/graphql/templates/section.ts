import { graphqlize } from '../../generate/helpers'
import {
    Survey,
    Edition,
    Section,
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
import {
    CARDINALITIES_ID,
    FEATURES_SECTION,
    ITEMS_ID,
    TOOLS_SECTION
} from '@devographics/constants'

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
    const isFeatureSection =
        section.id === 'features' ||
        section.id === FEATURES_SECTION ||
        (section.template && ['featurev3'].includes(section.template))

    const isToolSection =
        section.id === 'libraries' ||
        section.id === TOOLS_SECTION ||
        (section.template && ['tool', 'toolv3'].includes(section.template))

    const isFeatureOrToolSection = isFeatureSection || isToolSection
    const featureOrToolTypeName = isFeatureSection
        ? getFeatureFieldTypeName({ survey })
        : getToolFieldTypeName({ survey })

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
            ${
                isFeatureOrToolSection
                    ? `"""
                    Query all items included in this section at once.
                    """
                    ${ITEMS_ID}(itemIds:[${
                          isFeatureSection
                              ? getFeaturesEnumTypeName(survey)
                              : getToolsEnumTypeName(survey)
                      }]): [${featureOrToolTypeName}]`
                    : ''
            }
            ${
                isFeatureOrToolSection
                    ? `"""
                Get cardinalities data for this section (how many respondents used 1 item, how many used 2, etc.)
                """${CARDINALITIES_ID}: [${featureOrToolTypeName}]`
                    : ''
            }
    ${
        section?.questions
            ? section.questions
                  .filter(q => q.hasApiEndpoint !== false)
                  .map((question: QuestionApiObject) => {
                      return `${question.id}: ${question.fieldTypeName}`
                  })
                  .join('\n    ')
            : ''
    }
}`
    }
}
