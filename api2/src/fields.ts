import allFields from './fields/index'
import { applyTemplate } from './templates'
import { AllFields, Survey, Edition, Section, Question, Field, Option } from './types'
import uniq from 'lodash/uniq.js'
import { logToFile } from './debug'
import { loadOrGetSurveys } from './surveys'
import {
    generateOptionsType,
    generateEnumType,
    generateFilterType,
    generateSurveysType,
    generateSurveyType,
    generateEditionType,
    generateSectionType,
    generateFieldType
} from './graphql_templates'
import { templates } from './templates'

export const graphqlize = (str: string) => capitalizeFirstLetter(snakeToCamel(str))

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

export const getGraphQLTypeForField = ({
    survey,
    edition,
    question
}: {
    survey: Survey
    edition: Edition
    question: Question
}) => {
    return question.fieldTypeName || graphqlize(survey.slug) + graphqlize(question.id)
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

    const questionObjects = getMergedQuestionObjects({ surveys, fieldDefinitions })
    await logToFile('mergedQuestionObjects.yml', questionObjects, { mode: 'overwrite' })

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
                            section,
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

/*

Merge all similar questions within a survey to avoid generating too many
identical types later on

*/
export const getMergedQuestionObjects = ({
    fieldDefinitions,
    surveys
}: {
    fieldDefinitions: Field[]
    surveys: Survey[]
}) => {
    let allQuestionObjects: Question[] = []

    for (const survey of surveys) {
        const surveyQuestionObjects: Question[] = []

        for (const edition of survey.editions) {
            if (edition.questions) {
                for (const section of edition.questions) {
                    for (const question of section.questions) {
                        const questionObject = getQuestionObject({
                            survey,
                            edition,
                            section,
                            question,
                            fieldDefinitions
                        })
                        const existingQuestionObjectIndex = surveyQuestionObjects.findIndex(
                            q => q.id === questionObject.id
                        )
                        const existingQuestionObject =
                            surveyQuestionObjects[existingQuestionObjectIndex]

                        if (existingQuestionObject) {
                            const newOptions = mergeOptions(
                                existingQuestionObject.options,
                                questionObject.options
                            )
                            const editions = [
                                ...existingQuestionObject.editions,
                                ...questionObject.editions
                            ]
                            surveyQuestionObjects[existingQuestionObjectIndex] = {
                                ...existingQuestionObject,
                                ...questionObject,
                                editions,
                                ...(newOptions ? { options: newOptions } : {})
                            }
                        } else {
                            surveyQuestionObjects.push(questionObject)
                        }
                    }
                }
            }
        }
        allQuestionObjects = [...allQuestionObjects, ...surveyQuestionObjects]
    }
    return allQuestionObjects
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
    if (!Array.isArray(options1) || !Array.isArray(options2)) {
        return
    }
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
    section,
    question,
    fieldDefinitions
}: {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
    fieldDefinitions: Question[]
}) => {
    const questionDefinition = fieldDefinitions.find(q => q.id === question.id)
    const editions = [edition.surveyId]

    const fieldTypeName = getGraphQLTypeForField({
        survey,
        edition,
        question
    })

    let questionObject: Question = {
        fieldTypeName,
        ...question,
        ...(questionDefinition ? questionDefinition : {}),
        editions
    }

    questionObject = applyQuestionTemplate({ survey, edition, section, question: questionObject })

    if (questionObject.options) {
        questionObject.options = questionObject.options.map(o => ({
            ...o,
            editions: [edition.surveyId]
        }))
    }

    return questionObject
}

export const applyQuestionTemplate = (options: {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}) => {
    const { survey, edition, section, question } = options
    const template = question.template || section.template

    const templateFunction = templates[template]
    if (templateFunction) {
        return { ...question, template, ...templateFunction(options) }
    } else {
        console.log(`// template ${template} not found!`)
        return { ...question, template }
    }
}
