import allFields from './fields/index'
import { applyTemplate } from './templates'
import { AllFields, Field, Option } from './types'
import uniq from 'lodash/uniq.js'
import { logToFile } from './debug'

const graphqlize = (str: string) => capitalizeFirstLetter(snakeToCamel(str))

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const snakeToCamel = (str: string) =>
    str
        .toLowerCase()
        .replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''))

export const loadFieldDefinitions = () => {
    let fieldDefinitions: Field[] = []
    Object.entries(allFields as AllFields).map(([sectionId, section]) => {
        section.id = sectionId
        const sectionFields = section.fields.map((field: Field) => applyTemplate(field, section))
        fieldDefinitions = [...fieldDefinitions, ...sectionFields]
    })
    return fieldDefinitions
}

type Survey = any
type Edition = any
type Section = any
type Question = any

export const getGraphQLTypeForField = (fieldDefinitions: Field[], fieldId: string) => {
    const field = fieldDefinitions.find(field => field.id === fieldId)
    return (field && field.fieldTypeName) || graphqlize(fieldId)
}

export const generateSurveysTypeDefs = async ({
    fieldDefinitions,
    surveys
}: {
    fieldDefinitions: Field[]
    surveys: Survey[]
}) => {
    const typeDefs = []

    // store all options for all fields contained in survey question outlines
    const questionsDictionary: Question[] = []

    // type for all surveys
    typeDefs.push(generateSurveysType({ surveys }))

    for (const survey of surveys) {
        // type for a single kind of survey (state of js, state of css, etc.)
        typeDefs.push(generateSurveyType({ survey }))

        for (const surveyEdition of survey.editions) {
            // type for all editions of a survey
            typeDefs.push(generateEditionType({ survey, surveyEdition }))

            if (surveyEdition.questions) {
                for (const section of surveyEdition.questions) {
                    // type for all sections of a survey edition
                    typeDefs.push(
                        generateSectionType({ survey, surveyEdition, section, fieldDefinitions })
                    )

                    for (const question of section.questions) {
                        if (question.options) {
                            // add current edition to all question options items
                            const questionOptionsWithEdition = question.options.map(
                                (o: Option) => ({ ...o, editions: [surveyEdition.surveyId] })
                            )
                            const existingQuestionIndex = questionsDictionary.findIndex(
                                (q: Question) => q.id === question.id
                            )
                            const existingQuestion = questionsDictionary[existingQuestionIndex]
                            if (existingQuestion?.options) {
                                const mergedOptions = mergeOptions(
                                    existingQuestion?.options,
                                    questionOptionsWithEdition
                                )
                                questionsDictionary[existingQuestionIndex] = {
                                    id: question.id,
                                    options: mergedOptions
                                }
                            } else {
                                questionsDictionary.push({
                                    id: question.id,
                                    options: questionOptionsWithEdition
                                })
                            }
                        }
                    }
                }
            }
        }
    }
    await logToFile('questionsDictionary.yml', questionsDictionary, {
        mode: 'overwrite'
    })

    return typeDefs.join('\n\n')
}

export const generateTypeDefs = async ({
    fieldDefinitions,
    surveys
}: {
    fieldDefinitions: Field[]
    surveys: any[]
}) => {
    const generatedTypes: string[] = []
    const typeDefs = []
    for (const field of fieldDefinitions) {
        const typeNameRoot = field.fieldTypeName || graphqlize(field.id)
        const {
            id,
            options,
            optionsAreNumeric,
            optionsTypeName = typeNameRoot + 'ID',
            filterTypeName = typeNameRoot + 'Filter'
        } = field

        // options
        if (options) {
            if (!generatedTypes.includes(typeNameRoot)) {
                generatedTypes.push(typeNameRoot)
                typeDefs.push(generateFieldType({ typeName: typeNameRoot, optionsTypeName }))
            }
            if (!generatedTypes.includes(optionsTypeName)) {
                generatedTypes.push(optionsTypeName)
                typeDefs.push(
                    generateEnumType({ typeName: optionsTypeName, options, optionsAreNumeric })
                )
            }
            if (!generatedTypes.includes(filterTypeName)) {
                generatedTypes.push(filterTypeName)
                typeDefs.push(generateFilterType({ typeName: filterTypeName, optionsTypeName }))
            }
        } else {
            if (!generatedTypes.includes(typeNameRoot)) {
                generatedTypes.push(typeNameRoot)
                typeDefs.push(generateFieldType({ typeName: typeNameRoot }))
            }
        }
    }
    return typeDefs.join('\n\n')
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
export const generateEnumType = ({
    typeName,
    options,
    optionsAreNumeric
}: {
    typeName: string
    options: Option[]
    optionsAreNumeric: boolean
}) => {
    return `enum ${typeName} {
    ${options.map(i => (optionsAreNumeric ? `value_${i.id}` : i.id)).join('\n    ')}
}`
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
    return `input ${typeName} {
    eq: ${optionsTypeName}
    in: [${optionsTypeName}]
    nin: [${optionsTypeName}]
}`
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
    return `type ${typeName} {
    all_years: [YearData]
    year(year: Int!): YearData${optionsTypeName ? `\n    keys: [${optionsTypeName}]` : ''}
}`
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
    return `type Surveys {
    ${surveys
        .map((survey: Survey) => `${survey.slug}: ${graphqlize(survey.slug)}Survey`)
        .join('\n    ')}
}`
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
    return `type ${graphqlize(survey.slug)}Survey {
    ${survey.editions
        .map(
            (surveyEdition: Edition) =>
                `year_${surveyEdition.year}: ${graphqlize(survey.slug)}${surveyEdition.year}Edition`
        )
        .join('\n    ')}
}`
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
    surveyEdition
}: {
    survey: Survey
    surveyEdition: Edition
}) => {
    return `type ${graphqlize(survey.slug)}${surveyEdition.year}Edition {
  ${
      surveyEdition.questions
          ? surveyEdition.questions
                .map(
                    (section: Section) =>
                        `${section.id}: ${graphqlize(survey.slug)}${surveyEdition.year}${graphqlize(
                            section.id
                        )}Section`
                )
                .join('\n    ')
          : 'empty: Boolean'
  }
}`
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
    surveyEdition,
    section,
    fieldDefinitions
}: {
    survey: Survey
    surveyEdition: Edition
    section: Section
    fieldDefinitions: Field[]
}) => {
    return `type ${graphqlize(survey.slug)}${surveyEdition.year}${graphqlize(section.id)}Section {
${section.questions
    .filter((q: Question) => q.includeInApi !== false)
    .map(
        (question: Question) =>
            `${question.id}: ${getGraphQLTypeForField(fieldDefinitions, question.id)}`
    )
    .join('\n    ')}
}`
}

/*

Take: 

[
    { id: 'foo', editions: ['js2021', 'js2022'] },
    { id: 'bar', editions: ['js2020', 'js2021'] },
]

And


[
    { id: 'foo', editions: ['js2023'] },
    { id: 'baz', editions: ['js2023'] },
]

And merge them into: 


[
    { id: 'foo', editions: ['js2021', 'js2022', 'js2023'] },
    { id: 'bar', editions: ['js2020', 'js2021'] },
    { id: 'baz', editions: ['js2023'] },
]

*/
export const mergeOptions = (options1: Option[], options2: Option[]) => {
    const options: Option[] = [...options1]
    options2.forEach(o2 => {
        const existingOptionIndex = options.findIndex(o => o.id === o2.id)
        const existingOption = options[existingOptionIndex]
        if (existingOption) {
            const mergedEditions = uniq([
                ...(existingOption?.editions || []),
                ...(o2?.editions || [])
            ])
            const newOption = { ...existingOption, editions: mergedEditions }
            options[existingOptionIndex] = newOption
        } else {
            options.push(o2)
        }
    })
    return options
}
