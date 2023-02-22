import { Option } from '../types'
import { graphqlize, mergeSections } from './helpers'
import { Survey, Edition, Section, QuestionObject, TypeObject } from './types'

/*

Sample output:

type Surveys {
    metadata: SurveyMetadata
    demo_survey: DemoSurveySurvey
    state_of_css: StateOfCssSurvey
    state_of_graphql: StateOfGraphqlSurvey
    state_of_js: StateOfJsSurvey
}
*/
export const generateSurveysType = ({ surveys, path }: { surveys: Survey[]; path: string }) => {
    return {
        path,
        typeName: 'Surveys',
        typeDef: `type Surveys {
    ${surveys
        .map((survey: Survey) => `${survey.id}: ${graphqlize(survey.id)}Survey`)
        .join('\n    ')}
}`
    }
}

/*

Sample output: 

type StateOfJsSurvey {
    year_2016: StateOfJs2016Edition
    year_2017: StateOfJs2017Edition
    year_2018: StateOfJs2018Edition
    year_2019: StateOfJs2019Edition
    year_2020: StateOfJs2020Edition
    year_2021: StateOfJs2021Edition
    year_2022: StateOfJs2022Edition
}

*/
export const generateSurveyType = ({ survey, path }: { survey: Survey; path: string }) => {
    const typeName = graphqlize(survey.id) + 'Survey'
    return {
        path,
        typeName,
        typeDef: `type ${typeName} {
    _metadata: SurveyMetadata
    ${survey.editions
        .map((edition: Edition) => `${edition.id}: ${graphqlize(edition.id)}Edition`)
        .join('\n    ')}
}`
    }
}

/*

Sample output:

enum StateOfJsEditionID {
    js2020
    js2021
    js2022
    js2023
}

*/
export const generateSurveyEditionsEnumType = ({
    survey,
    path
}: {
    survey: Survey
    path: string
}) => {
    const { editions } = survey
    const typeName = `${graphqlize(survey.id)}EditionID`
    return {
        path,
        typeName,
        typeDef: `enum ${typeName} {
    ${editions.map((e: Edition) => e.id).join('\n    ')}
}`
    }
}

/*

Sample output:

type StateOfJs2021Edition {
    language: StateOfJs2021LanguageSection
    other_features: StateOfJs2021OtherFeaturesSection
    front_end_frameworks: StateOfJs2021FrontEndFrameworksSection
    back_end_frameworks: StateOfJs2021BackEndFrameworksSection
    other_tools: StateOfJs2021OtherToolsSection
    resources: StateOfJs2021ResourcesSection
    opinions: StateOfJs2021OpinionsSection
    user_info: StateOfJs2021UserInfoSection
}

*/
export const generateEditionType = ({
    survey,
    edition,
    path
}: {
    survey: Survey
    edition: Edition
    path: string
}) => {
    const typeName = `${graphqlize(edition.id)}Edition`
    const allSections = mergeSections(edition.sections, edition.apiSections)

    return {
        path,
        typeName,
        typeDef: `type ${typeName} {
    _metadata: EditionMetadata
    ${
        allSections.length > 0
            ? allSections
                  .map(
                      (section: Section) =>
                          `${section.id}: ${graphqlize(edition.id)}${graphqlize(section.id)}Section`
                  )
                  .join('\n    ')
            : 'empty: Boolean'
    }
}`
    }
}

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
    questions,
    path
}: {
    survey: Survey
    edition: Edition
    section: Section
    questions: QuestionObject[]
    path: string
}) => {
    const typeName = `${graphqlize(edition.id)}${graphqlize(section.id)}Section`
    return {
        path,
        typeName,
        typeDef: `type ${typeName} {
    ${questions
        .map((question: QuestionObject) => {
            return `${question.id}: ${question.fieldTypeName}`
        })
        .join('\n    ')}
}`
    }
}

/*

Sample output:

type DisabilityStatus {
    all_years: [YearData]
    year(year: Int!): YearData
    options: [DisabilityStatusOptions]
}

*/
export const generateFieldType = ({ question }: { question: QuestionObject }) => {
    const { fieldTypeName, optionTypeName, options } = question

    const filtersTypeName = graphqlize(question.surveyId) + 'Filters'
    const facetsTypeName = graphqlize(question.surveyId) + 'Facets'
    return {
        typeName: fieldTypeName,
        typeType: 'question',
        typeDef: `type ${fieldTypeName} {
    responses(filters: ${filtersTypeName}, options: Options, facet: ${facetsTypeName}): Responses${
            options ? `\n    options: [${optionTypeName}]` : ''
        }
}`
    }
}

/*

Sample output: 

input DisabilityStatusFilter {
    eq: DisabilityStatusID
    in: [DisabilityStatusID]
    nin: [DisabilityStatusID]
}

*/
export const generateFilterType = ({ question }: { question: QuestionObject }) => {
    const { filterTypeName, enumTypeName } = question
    if (!filterTypeName) return
    return {
        typeName: filterTypeName,
        typeType: 'filter',
        surveyId: question.surveyId,
        questionId: question.id,
        typeDef: `input ${filterTypeName} {
    eq: ${enumTypeName}
    in: [${enumTypeName}]
    nin: [${enumTypeName}]
}`
    }
}

/*

Sample output:

type DisabilityStatusOption {
    id: DisabilityStatusID
    editions: [StateOfJsEditionID]
}

*/
export const generateOptionType = ({ question }: { question: QuestionObject }) => {
    const { optionTypeName, enumTypeName, surveyId, options } = question
    if (!optionTypeName) return
    const optionsHaveAverage = options?.some((o: Option) => typeof o.average !== 'undefined')
    return {
        typeName: optionTypeName,
        typeType: 'option',
        typeDef: `type ${optionTypeName} {
    id: ${enumTypeName}
    editions: [${graphqlize(surveyId)}EditionID]${optionsHaveAverage ? '\n    average: Float' : ''}
}`
    }
}

/*

Sample output:

enum DisabilityStatusID {
    visual_impairments
    hearing_impairments
    mobility_impairments
    cognitive_impairments
    not_listed
}

*/
export const generateEnumType = ({ question }: { question: QuestionObject }) => {
    const { enumTypeName, options, optionsAreNumeric } = question
    if (!enumTypeName) return
    return {
        typeName: enumTypeName,
        typeType: 'enum',
        typeDef: `enum ${enumTypeName} {
    ${options?.map((o: Option) => (optionsAreNumeric ? `value_${o.id}` : o.id)).join('\n    ')}
}`
    }
}

/*

Sample output: 


input StateOfJsFilters {
    language__proxies: FeatureFilter
    language__promise_all_settled: FeatureFilter
    language__dynamic_import: FeatureFilter
    language__nullish_coalescing: FeatureFilter
    language__optional_chaining: FeatureFilter
    # etc.
}

Note: when a question appears in different sections in different editions, 
use the most recent section. 

*/
export const generateFiltersType = ({
    survey,
    questionObjects
}: {
    survey: Survey
    questionObjects: QuestionObject[]
}) => {
    const typeName = graphqlize(survey.id) + 'Filters'
    return {
        typeName,
        typeDef: `input ${typeName} {
    ${questionObjects
        .filter(q => q.filterTypeName && q.surveyId === survey.id)
        .map(q => `${q.sectionIds.at(-1)}__${q.id}: ${q.filterTypeName}`)
        .join('\n    ')}
}`
    }
}

/*

Sample output: 

enum StateOfJsFacets {
    language__proxies
    language__promise_all_settled
    language__dynamic_import
    language__nullish_coalescing
    language__optional_chaining
    language__private_fields
    # etc.
}

Note: when a question appears in different sections in different editions, 
use the most recent section. 

*/
export const generateFacetsType = ({
    survey,
    questionObjects
}: {
    survey: Survey
    questionObjects: QuestionObject[]
}) => {
    const typeName = graphqlize(survey.id) + 'Facets'
    const questionObjectsWithFilters = questionObjects.filter(
        q => typeof q.filterTypeName !== 'undefined' && q.surveyId === survey.id
    )
    return {
        typeName,
        typeDef: `enum ${typeName} {
    ${questionObjectsWithFilters.map(q => `${q.sectionIds.at(-1)}__${q.id}`).join('\n    ')}
}`
    }
}
