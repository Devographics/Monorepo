import { Option } from '../types'
import { graphqlize } from './helpers'
import { Survey, Edition, Section, QuestionObject } from './types'

/*

Sample output:

type Surveys {
    demo_survey: DemoSurveySurvey
    state_of_css: StateOfCssSurvey
    state_of_graphql: StateOfGraphqlSurvey
    state_of_js: StateOfJsSurvey
}
*/
export const generateSurveysType = ({ surveys }: { surveys: Survey[] }) => {
    return {
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
export const generateSurveyType = ({ survey }: { survey: Survey }) => {
    const typeName = graphqlize(survey.id)
    return {
        typeName,
        typeDef: `type ${typeName}Survey {
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
export const generateSurveyEditionsEnumType = ({ survey }: { survey: Survey }) => {
    const { editions } = survey
    const typeName = `${graphqlize(survey.id)}EditionID`
    return {
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
export const generateEditionType = ({ survey, edition }: { survey: Survey; edition: Edition }) => {
    const typeName = `${graphqlize(edition.id)}Edition`
    return {
        typeName,
        typeDef: `type ${typeName} {
    ${
        edition.sections
            ? edition.sections
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
    age: Age
    years_of_experience: YearsOfExperience
    company_size: CompanySize
    yearly_salary: YearlySalary
    higher_education_degree: HigherEducationDegree
    country: Country
    gender: Gender
    race_ethnicity: RaceEthnicity
    disability_status: DisabilityStatus
}

*/
export const generateSectionType = ({
    edition,
    section,
    questions
}: {
    edition: Edition
    section: Section
    questions: QuestionObject[]
}) => {
    const typeName = `${graphqlize(edition.id)}${graphqlize(section.id)}Section`
    return {
        typeName,
        typeDef: `type ${typeName} {
    ${questions
        .filter((q: QuestionObject) => q.includeInApi !== false)
        .map((question: QuestionObject) => `${question.id}: ${question.fieldTypeName}`)
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
    return {
        typeName: fieldTypeName,
        typeDef: `type ${fieldTypeName} {
    all_years: [YearData]
    year(year: Int!): YearData${options ? `\n    options: [${optionTypeName}]` : ''}
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
    return {
        typeName: filterTypeName,
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
    const optionsHaveAverage = options?.some((o: Option) => typeof o.average !== 'undefined')
    return {
        typeName: optionTypeName,
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
    return {
        typeName: enumTypeName,
        typeDef: `enum ${enumTypeName} {
    ${options?.map((o: Option) => (optionsAreNumeric ? `value_${o.id}` : o.id)).join('\n    ')}
}`
    }
}
