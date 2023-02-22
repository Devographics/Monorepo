import { Survey, Edition, Section, Question, QuestionObject, Option } from './types'
import { logToFile } from '../debug'
import {
    graphqlize,
    getGlobalQuestions,
    applyQuestionTemplate,
    mergeOptions,
    mergeSections
} from './helpers'
import {
    generateSurveysTypeObjects,
    generateQuestionsTypeObjects,
    generateFiltersTypeObjects,
    generateFacetsTypeObjects
} from './typedefs'
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
    const filtersTypeObjects = generateFiltersTypeObjects({
        surveys,
        questionObjects
    })
    const facetsTypeObjects = generateFacetsTypeObjects({
        surveys,
        questionObjects
    })
    const allTypeObjects = [
        ...surveysTypeObjects,
        ...questionsTypeObjects,
        ...filtersTypeObjects,
        ...facetsTypeObjects
    ]
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
            const allSections = mergeSections(edition.sections, edition.apiSections)

            if (allSections) {
                for (const section of allSections) {
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

Take a question from the outline and convert it into a "rich" question object

Override priority (lower = higher priority): 

- defaults
- template output
- global definition
- outline definition

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
    // apply template
    const templateObject = applyQuestionTemplate({
        survey,
        edition,
        section,
        question
    })

    const questionId = question.id || templateObject.id
    // initialize defaults
    const fieldTypeName = graphqlize(survey.id) + graphqlize(questionId)

    const defaultObject = {
        fieldTypeName,
        sectionIds: [section.id], // a question can belong to more than one section in different editions
        surveyId: survey.id,
        editions: [edition.id]
    }

    // if a global question definition exists, extend question with it
    const globalQuestions = getGlobalQuestions()
    const globalQuestionDefinition = globalQuestions.find(q => q.id === questionId)
    const globalObject = globalQuestionDefinition
        ? { ...globalQuestionDefinition, isGlobal: true }
        : {}

    const questionObject = {
        ...defaultObject,
        ...templateObject,
        ...globalObject,
        ...question
    }

    if (questionObject.options) {
        if (!questionObject.optionTypeName) {
            questionObject.optionTypeName = fieldTypeName + 'Option'
        }
        if (!questionObject.enumTypeName) {
            questionObject.enumTypeName = fieldTypeName + 'ID'
        }
        if (!questionObject.filterTypeName) {
            questionObject.filterTypeName = fieldTypeName + 'Filter'
        }
    }

    // add editions field to options
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

    return {
        ...q1,
        ...q2,
        sectionIds,
        editions,
        ...(newOptions ? { options: newOptions } : {})
    }
}
