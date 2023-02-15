import allFields from './fields/index'
import { applyTemplate } from './templates'
import { AllFields, Field, Option } from './types'
import uniq from 'lodash/uniq.js'
import { logToFile } from './debug'
import { loadOrGetSurveys } from './surveys'

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

export const getGraphQLTypeForField = ({
    survey,
    edition,
    question
}: {
    survey: Survey
    edition: Edition
    question: Question
}) => {
    return question.fieldTypeName || graphqlize(edition.surveyId) + graphqlize(question.id)
}

export const generateTypeDefs = async () => {
    const fieldDefinitions = loadFieldDefinitions()
    const surveys = await loadOrGetSurveys()
    const { typeObjects: surveysTypeObjects } = await generateSurveysTypeDefs({
        fieldDefinitions,
        surveys
    })

    const surveysTypeDefs = surveysTypeObjects.map(o => o.typeDef)

    // const { typeDefs: otherTypeDefs } = await generateOtherTypeDefs({
    //     fieldDefinitions,
    //     questionsDictionary
    // })

    // await logToFile('questionsDictionary.yml', questionsDictionary, {
    //     mode: 'overwrite'
    // })
    // await logToFile('types.graphql', otherTypeDefs.join('\n\n'), { mode: 'overwrite' })
    await logToFile('surveys.graphql', surveysTypeDefs.join('\n\n'), { mode: 'overwrite' })

    const allTypeDefs = surveysTypeDefs
    return allTypeDefs.join('\n\n')
}

type TypeObject = {
    typeName: string
    typeDef: string
}

export const generateSurveysTypeDefs = async ({
    fieldDefinitions,
    surveys
}: {
    fieldDefinitions: Field[]
    surveys: Survey[]
}) => {
    let typeObjects = []

    // store all options for all fields contained in survey question outlines
    // const allQuestions: Question[] = []

    // type for all surveys
    typeObjects.push(generateSurveysType({ surveys }))

    for (const survey of surveys) {
        // type for a single kind of survey (state of js, state of css, etc.)
        typeObjects.push(generateSurveyType({ survey }))

        for (const edition of survey.editions) {
            // type for all editions of a survey
            typeObjects.push(generateEditionType({ survey, edition }))

            if (edition.questions) {
                for (const section of edition.questions) {
                    const sectionQuestionObjects = []
                    for (const question of section.questions) {
                        // extend question with canonical question definition
                        const questionObject = getQuestionObject({
                            survey,
                            edition,
                            question,
                            fieldDefinitions
                        })
                        sectionQuestionObjects.push(questionObject)

                        // extend question object with question definition, if it exists

                        let questionTypeObjects = []

                        const existingTypeDef = typeObjects.find(
                            t => t.typeName === questionObject.fieldTypeName
                        )

                        if (!existingTypeDef) {
                            questionTypeObjects = generateQuestionTypeDefs({
                                question: questionObject
                            })
                            typeObjects = [...typeObjects, ...questionTypeObjects]
                        }
                    }

                    // type for all sections of a survey edition
                    typeObjects.push(
                        generateSectionType({
                            survey,
                            edition,
                            section: { ...section, questions: sectionQuestionObjects }
                        })
                    )
                }
            }
        }
    }

    return { typeObjects }
}

export const generateQuestionTypeDefs = ({ question }: { question: Field }) => {
    const typeObjects = []
    const typeNameRoot = question.fieldTypeName || graphqlize(question.id)
    const {
        options,
        optionsAreNumeric,
        optionsTypeName = typeNameRoot + 'ID',
        filterTypeName = typeNameRoot + 'Filter'
    } = question

    if (options) {
        typeObjects.push(generateFieldType({ typeName: typeNameRoot, optionsTypeName }))
        typeObjects.push(generateFilterType({ typeName: filterTypeName, optionsTypeName }))
        typeObjects.push(
            generateEnumType({ typeName: optionsTypeName, options, optionsAreNumeric })
        )
    } else {
        // no options
        typeObjects.push(generateFieldType({ typeName: typeNameRoot }))
    }
    return typeObjects
}

export const generateOptionsTypeDef = () => {}
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

/*

Take a question from the outline and extend it
with canonical definition from the API YAMLs, if 
it exists

*/
export const getQuestionObject = ({
    survey,
    edition,
    question,
    fieldDefinitions
}: {
    survey: Survey
    edition: Edition
    question: Question
    fieldDefinitions: Question[]
}) => {
    const questionDefinition = fieldDefinitions.find(q => q.id === question.id)
    let questionObject: Question
    if (questionDefinition) {
        questionObject = {
            fieldTypeName: graphqlize(question.id),
            ...question,
            ...questionDefinition
        }
    } else {
        const fieldTypeName = getGraphQLTypeForField({
            survey,
            edition,
            question
        })
        questionObject = { ...question, fieldTypeName }
    }
    return questionObject
}
