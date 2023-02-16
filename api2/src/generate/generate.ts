import { Survey, Edition, Section, Question, Field, Option } from '../types'
import { logToFile } from '../debug'
import { loadOrGetSurveys } from '../surveys'
import {
    generateOptionType,
    generateEnumType,
    generateFilterType,
    generateSurveysType,
    generateSurveyType,
    generateEditionType,
    generateSectionType,
    generateFieldType,
    generateSurveyEditionsEnumType
} from './graphql_templates'
import { graphqlize, getGlobalQuestions, applyQuestionTemplate, mergeOptions } from './helpers'

type TypeObject = {
    typeName: string
    typeDef: string
}

export const generateTypeDefs = async () => {
    const surveys = await loadOrGetSurveys()

    const questionObjects = getQuestionObjects({ surveys })
    await logToFile('questionObjects.yml', questionObjects, { mode: 'overwrite' })

    const surveysTypeObjects = await generateSurveysTypeObjects({
        surveys,
        questionObjects
    })
    const surveysTypeDefs = surveysTypeObjects.map(o => o.typeDef)

    const questionsTypeObjects = await generateQuestionsTypeObjects({
        questionObjects
    })
    const questionTypeDefs = questionsTypeObjects.map(o => o.typeDef)

    const allTypeDefs = [...surveysTypeDefs, ...questionTypeDefs]
    const allTypeDefsString = allTypeDefs.join('\n\n')
    await logToFile('typeDefs.graphql', allTypeDefsString, { mode: 'overwrite' })

    return allTypeDefsString
}

/*

Generate typeDefs corresponding to survey arborescence

*/
export const generateSurveysTypeObjects = async ({
    surveys,
    questionObjects
}: {
    surveys: Survey[]
    questionObjects: Question[]
}) => {
    let typeObjects = []

    // store all options for all fields contained in survey question outlines
    // const allQuestions: Question[] = []

    // type for all surveys
    typeObjects.push(generateSurveysType({ surveys }))

    for (const survey of surveys) {
        // type for a single kind of survey (state of js, state of css, etc.)
        typeObjects.push(generateSurveyType({ survey }))
        typeObjects.push(generateSurveyEditionsEnumType({ survey }))

        for (const edition of survey.editions) {
            // type for all editions of a survey
            typeObjects.push(generateEditionType({ survey, edition }))

            if (edition.questions) {
                for (const section of edition.questions) {
                    // make sure to get "rich" questions from questionObjects
                    // and not "raw" questions from edition.questions
                    const sectionQuestionObjects = questionObjects.filter(
                        q => q.sectionId === section.id && q.editions.includes(edition.surveyId)
                    )

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

    return typeObjects
}

/*

Generate typeDefs corresponding to all questions

*/
export const generateQuestionsTypeObjects = async ({
    questionObjects
}: {
    questionObjects: Question[]
}) => {
    const typeObjects: TypeObject[] = []

    for (const question of questionObjects) {
        const { options, fieldTypeName, optionTypeName, enumTypeName, filterTypeName } = question

        if (options) {
            if (!typeObjects.find(t => t.typeName === fieldTypeName)) {
                typeObjects.push(generateFieldType({ question }))
            }
            if (!typeObjects.find(t => t.typeName === filterTypeName)) {
                typeObjects.push(generateFilterType({ question }))
            }
            if (!typeObjects.find(t => t.typeName === optionTypeName)) {
                typeObjects.push(generateOptionType({ question }))
            }
            if (!typeObjects.find(t => t.typeName === enumTypeName)) {
                typeObjects.push(generateEnumType({ question }))
            }
        } else {
            // no options
            if (!typeObjects.find(t => t.typeName === fieldTypeName)) {
                typeObjects.push(generateFieldType({ question }))
            }
        }
    }
    return typeObjects
}

/*

Parse all survey question outlines and extract a canonical list of all possible questions, 
while merging similar questions at a survey-by-survey level.

This means that e.g. all `id: blogs_news_magazines` questions from js2020, js2021, js2022, etc. 
will be merge under a single object with typeName StateOfJsBlogsNewsMagazines

But there will also be a separate `id: blogs_news_magazines` object for css2021, css2022, etc. 
with typeName StateOfCssBlogsNewsMagazines and different options. 

On the other hand, global questions (those defined in global_questions.yml) are unique 
at the level of the entire list.

*/
export const getQuestionObjects = ({ surveys }: { surveys: Survey[] }) => {
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
                            question
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

/*

Take a question from the outline and

1) initialize questioObject (add editions, etc.)
2) add types
3) extend it with global question definition if it exists
4) apply template if it exists
5) add editions field to options if they exist

*/
export const getQuestionObject = ({
    survey,
    edition,
    section,
    question
}: {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}) => {
    const editions = [edition.surveyId]

    // 1. initialize questionObject
    let questionObject: Question = {
        ...question,
        sectionId: section.id,
        surveyId: survey.slug,
        editions
    }

    // 2. add types
    const fieldTypeName = graphqlize(survey.slug) + graphqlize(question.id)
    questionObject = {
        fieldTypeName,
        optionTypeName: fieldTypeName + 'Option',
        enumTypeName: fieldTypeName + 'ID',
        filterTypeName: fieldTypeName + 'Filter',
        ...questionObject
    }

    // 2. if a global question definition exists, extend question with it
    const globalQuestions = getGlobalQuestions()
    const globalQuestionDefinition = globalQuestions.find(q => q.id === question.id)
    if (globalQuestionDefinition) {
        questionObject = {
            ...questionObject,
            ...globalQuestionDefinition,
            isGlobal: true
        }
    }

    // 3. apply question template
    questionObject = applyQuestionTemplate({ survey, edition, section, question: questionObject })

    // 4. add editions field to options
    if (questionObject.options) {
        questionObject.options = questionObject.options.map((o: Option) => ({
            ...o,
            editions: [edition.surveyId]
        }))
    }

    return questionObject
}
