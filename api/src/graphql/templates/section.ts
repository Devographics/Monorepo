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
    const typeName = `${graphqlize(edition.id)}${graphqlize(section.id)}Section`

    // TODO: find better way to figure out if a section is a feature or tool section
    const isFeatureSection =
        section.id === 'features' || (section.template && ['featurev3'].includes(section.template))

    const isToolSection =
        section.id === 'libraries' ||
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
        typeDef: `type ${typeName} {
            ${isFeatureOrToolSection ? `_items: [${featureOrToolTypeName}]` : ''}
            ${isFeatureOrToolSection ? `_cardinalities: [${featureOrToolTypeName}]` : ''}
    ${section.questions
        .filter(q => q.hasApiEndpoint !== false)
        .map((question: QuestionApiObject) => {
            return `${question.id}: ${question.fieldTypeName}`
        })
        .join('\n    ')}
}`
    }
}
