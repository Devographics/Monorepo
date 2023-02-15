import { Option } from './types'
import { graphqlize, getGraphQLTypeForField } from './fields'

type Survey = any
type Edition = any
type Section = any
type Question = any

export const generateOptionsType = () => {}
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
export const generateEnumType = ({
    typeName,
    options,
    optionsAreNumeric
}: {
    typeName: string
    options: Option[]
    optionsAreNumeric: boolean
}) => {
    return {
        typeName,
        typeDef: `enum ${typeName} {
    ${options.map(i => (optionsAreNumeric ? `value_${i.id}` : i.id)).join('\n    ')}
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
export const generateFilterType = ({
    typeName,
    optionsTypeName
}: {
    typeName: string
    optionsTypeName: string
}) => {
    return {
        typeName,
        typeDef: `input ${typeName} {
    eq: ${optionsTypeName}
    in: [${optionsTypeName}]
    nin: [${optionsTypeName}]
}`
    }
}

/*

Sample output:

type DisabilityStatus {
    all_years: [YearData]
    year(year: Int!): YearData
    keys: [DisabilityStatusID]
}

*/
export const generateFieldType = ({
    typeName,
    optionsTypeName
}: {
    typeName: string
    optionsTypeName?: string
}) => {
    return {
        typeName,
        typeDef: `type ${typeName} {
    all_years: [YearData]
    year(year: Int!): YearData${optionsTypeName ? `\n    keys: [${optionsTypeName}]` : ''}
}`
    }
}

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
        .map((survey: Survey) => `${survey.slug}: ${graphqlize(survey.slug)}Survey`)
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
    const typeName = graphqlize(survey.slug)
    return {
        typeName,
        typeDef: `type ${typeName}Survey {
    ${survey.editions
        .map(
            (surveyEdition: Edition) =>
                `year_${surveyEdition.year}: ${graphqlize(survey.slug)}${surveyEdition.year}Edition`
        )
        .join('\n    ')}
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
    const typeName = `${graphqlize(survey.slug)}${edition.year}Edition`
    return {
        typeName,
        typeDef: `type ${typeName} {
  ${
      edition.questions
          ? edition.questions
                .map(
                    (section: Section) =>
                        `${section.id}: ${graphqlize(survey.slug)}${edition.year}${graphqlize(
                            section.id
                        )}Section`
                )
                .join('\n    ')
          : 'empty: Boolean'
  }
}`
    }
}

/*

Sample output: 

type StateOfJs2021UserInfoSection {
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
    survey,
    edition,
    section
}: {
    survey: Survey
    edition: Edition
    section: Section
}) => {
    const typeName = `${graphqlize(survey.slug)}${edition.year}${graphqlize(section.id)}Section`
    return {
        typeName,
        typeDef: `type ${typeName} {
${section.questions
    .filter((q: Question) => q.includeInApi !== false)
    .map(
        (question: Question) =>
            `${question.id}: ${getGraphQLTypeForField({
                survey,
                edition: edition,
                question
            })}`
    )
    .join('\n    ')}
}`
    }
}
