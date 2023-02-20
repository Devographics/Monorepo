import { Survey, Edition, Section, Question, QuestionObject, Option } from './types'
import { logToFile } from '../debug'
import {
    graphqlize,
    getGlobalQuestions,
    applyQuestionTemplate,
    mergeOptions,
    getPath
} from './helpers'
import { generateSurveysTypeObjects, generateQuestionsTypeObjects } from './typedefs'
import uniq from 'lodash/uniq.js'

export const generateTypeObjects = async ({
    surveys,
    questionObjects
}: {
    surveys: Survey[]
    questionObjects: QuestionObject[]
}) => {
    await logToFile('questionObjects.yml', questionObjects, { mode: 'overwrite' })
    const surveysTypeObjects = await generateSurveysTypeObjects({
        surveys,
        questionObjects
    })
    const questionsTypeObjects = await generateQuestionsTypeObjects({
        questionObjects
    })
    const allTypeObjects = [...surveysTypeObjects, ...questionsTypeObjects]
    return allTypeObjects
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
    let allQuestionObjects: QuestionObject[] = []

    for (const survey of surveys) {
        const surveyQuestionObjects: QuestionObject[] = []

        for (const edition of survey.editions) {
            if (edition.sections) {
                for (const section of edition.sections) {
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
                            surveyQuestionObjects[existingQuestionObjectIndex] =
                                mergeQuestionObjects(existingQuestionObject, questionObject)
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

1) initialize questioObject (add editions, etc.) and add types
2) extend it with global question definition if it exists
3) apply template if it exists
4) add editions field to options if they exist

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
    const editions = [edition.id]

    // 1. initialize questionObject and add types
    const fieldTypeName = graphqlize(survey.id) + graphqlize(question.id)

    let questionObject: QuestionObject = {
        ...question,

        fieldTypeName,
        optionTypeName: fieldTypeName + 'Option',
        enumTypeName: fieldTypeName + 'ID',
        filterTypeName: fieldTypeName + 'Filter',

        sectionIds: [section.id], // a question can belong to more than one section in different editions
        surveyId: survey.id,
        editions,
        paths: [getPath({ survey, edition, section, question })]
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
            editions: [edition.id]
        }))
    }

    return questionObject
}

export const mergeQuestionObjects = (q1: QuestionObject, q2: QuestionObject) => {
    const newOptions = q1.options && q2.options && mergeOptions(q1.options, q2.options)

    const editions = uniq([...(q1?.editions || []), ...(q2?.editions || [])])

    const sectionIds = uniq([...(q1.sectionIds || []), ...(q2.sectionIds || [])])

    const paths = uniq([...(q1.paths || []), ...(q2.paths || [])])

    return {
        ...q1,
        ...q2,
        sectionIds,
        editions,
        paths,
        ...(newOptions ? { options: newOptions } : {})
    }
}
