import { Entity, OptionGroup, ResponsesTypes } from '@devographics/types'
import {
    Survey,
    Edition,
    Section,
    Question,
    SurveyApiObject,
    EditionApiObject,
    SectionApiObject,
    QuestionApiObject,
    Option,
    TypeObject
} from '../types/surveys'
import {
    graphqlize,
    applyQuestionTemplate,
    mergeOptions,
    mergeSections,
    getContentType,
    getDynamicOptions
} from './helpers'
import {
    generateSurveysTypeObjects,
    generateQuestionsTypeObjects,
    generateFiltersTypeObjects,
    generateFacetsTypeObjects,
    generateI18nTypeObjects,
    generateEntitiesTypeObjects
} from './typedefs'
import uniq from 'lodash/uniq.js'
import { RequestContext } from '../types'
import { getDbPath } from '../compute'

/*

Parse surveys and generate a "rich" version of the outline tree

*/
export const parseSurveys = async ({
    surveys,
    context
}: {
    surveys: Survey[]
    context: RequestContext
}): Promise<SurveyApiObject[]> => {
    return await Promise.all(surveys.map(survey => getSurveyObject({ survey, context })))
}

// Take a Survey and return a SurveyApiObject
export const getSurveyObject = async ({
    survey,
    context
}: {
    survey: Survey
    context: RequestContext
}): SurveyApiObject => {
    return {
        ...survey,
        editions: await Promise.all(
            survey.editions.map(edition => getEditionObject({ survey, edition, context }))
        )
    }
}

// Take an Edition and return an EditionApiObject
export const getEditionObject = async ({
    survey,
    edition,
    context
}: {
    survey: Survey
    edition: Edition
    context: RequestContext
}): Promise<EditionApiObject> => {
    const { apiSections, sections, ...rest } = edition
    const allSections = await Promise.all(
        mergeSections(edition.sections, edition.apiSections).map(section =>
            getSectionObject({ survey, edition, section, context })
        )
    )
    return {
        ...rest,
        survey,
        surveyId: survey.id,
        sections: allSections
    }
}

/*

Take a Section and return a SectionApiObject

Note: here we don't care if questionObjects are duplicated when identical questions
appear across different survey editions, so we make sure to generate a new questionObject
for every question. 

*/
export const getSectionObject = async ({
    survey,
    edition,
    section,
    context
}: {
    survey: Survey
    edition: Edition
    section: Section
    context: RequestContext
}): Promise<SectionApiObject> => {
    let questionObjects = section.questions.map(question =>
        getQuestionObject({ survey, edition, section, question })
    )
    // do another pass to add options and options types, especially dynamic options
    questionObjects = await Promise.all(
        questionObjects.map(question =>
            addQuestionOptions({ question, questionObjects, edition, context })
        )
    )

    const apiOnly = section.apiOnly || questionObjects.every(q => q.apiOnly)
    return {
        ...section,
        questions: questionObjects,
        apiOnly
    }
}

/*

Generate all GraphQL type objects

Note: we pass questionObjects array containing all questionObjects to make sure we
avoid duplicating similar GraphQL types and reuse definitions for similar questions. 

*/
export const generateTypeObjects = async ({
    surveys,
    questionObjects,
    entities,
    context
}: {
    surveys: SurveyApiObject[]
    questionObjects: QuestionApiObject[]
    entities: Entity[]
    context: RequestContext
}): Promise<TypeObject[]> => {
    const i18nTypeObjects = await generateI18nTypeObjects({
        surveys
    })
    const surveysTypeObjects = await generateSurveysTypeObjects({
        surveys
    })
    const questionsTypeObjects = await generateQuestionsTypeObjects({
        questionObjects,
        context
    })
    const filtersTypeObjects = generateFiltersTypeObjects({
        surveys,
        questionObjects
    })
    const facetsTypeObjects = generateFacetsTypeObjects({
        surveys,
        questionObjects
    })
    const entitiesTypeObjects = generateEntitiesTypeObjects({ entities })

    const allTypeObjects = [
        ...i18nTypeObjects,
        ...surveysTypeObjects,
        ...questionsTypeObjects,
        ...filtersTypeObjects,
        ...facetsTypeObjects,
        ...entitiesTypeObjects
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

*/
export const getQuestionObjects = ({ surveys }: { surveys: SurveyApiObject[] }) => {
    let allQuestionObjects: QuestionApiObject[] = []

    for (const survey of surveys) {
        const surveyQuestionObjects: QuestionApiObject[] = []
        for (const edition of survey.editions) {
            if (edition.sections) {
                for (const section of edition.sections) {
                    for (const question of section?.questions) {
                        const questionObject = question
                        const existingQuestionObjectIndex = surveyQuestionObjects.findIndex(
                            q => q.id === questionObject.id
                        )
                        const existingQuestionObject =
                            surveyQuestionObjects[existingQuestionObjectIndex]

                        if (existingQuestionObject) {
                            surveyQuestionObjects[existingQuestionObjectIndex] =
                                mergeQuestionObjectsv2(existingQuestionObject, questionObject)
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
}): QuestionApiObject => {
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

    const templateOutputWithExtraFields: QuestionApiObject = {
        fieldTypeName,
        sectionIds: [section.id], // a question can belong to more than one section in different editions
        sectionIndex: edition?.sections?.findIndex(s => s.id === section.id), // just a simple way to group questions together when belonging to same section
        surveyId: survey.id,
        survey,
        editions: [edition.id],
        editionId: edition.id,
        edition,
        section,
        ...templateObject
    }

    let questionObject: QuestionApiObject = {
        ...templateOutputWithExtraFields,
        ...question
    }

    questionObject.contentType = getContentType(questionObject)

    return questionObject
}

export const addQuestionOptions = async ({
    question,
    questionObjects,
    edition,
    context
}: {
    question: QuestionApiObject
    questionObjects: QuestionApiObject[]
    edition: Edition
    context: RequestContext
}) => {
    const { options, groups, fieldTypeName } = question
    const hasOptions = options || groups
    let hasDynamicOptions = false

    // if question doesn't have predefined options, try to generate
    // them dynamically from the top X most popular answers
    // to this question for the latest survey edition
    if (!hasOptions) {
        const dynamicOptions = await getDynamicOptions({
            question: question,
            questionObjects,
            context
        })
        if (dynamicOptions) {
            question.options = dynamicOptions
            hasDynamicOptions = true
        }
    }

    if (hasOptions || hasDynamicOptions) {
        if (!question.optionTypeName) {
            question.optionTypeName = fieldTypeName + 'Option'
        }
        if (!question.enumTypeName) {
            if (hasDynamicOptions) {
                question.enumTypeName = fieldTypeName + 'DynamicID'
            } else {
                question.enumTypeName = fieldTypeName + 'ID'
            }
        }
        if (!question.filterTypeName) {
            question.filterTypeName = fieldTypeName + 'Filter'
        }
    }

    // add editions field to options
    if (question.options) {
        question.options = question.options.map((o: Option) => ({
            ...o,
            editions: [edition.id]
        }))
    }

    // add editions field to groups
    if (question.groups) {
        question.groups = question.groups.map((o: OptionGroup) => ({
            ...o,
            editions: [edition.id]
        }))
    }
    return question
}

export const mergeQuestionObjects = (q1: QuestionApiObject, q2: QuestionApiObject) => {
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

/* 

v2: instead of trying to merge the two questions, only keep the one belonging to the most
recent edition

*/
export const mergeQuestionObjectsv2 = (q1: QuestionApiObject, q2: QuestionApiObject) => {
    const q1IsMoreRecent = (q1?.edition?.year || 0) > (q2?.edition?.year || 0)

    const q = q1IsMoreRecent ? q1 : q2

    const editions = uniq([...(q1?.editions || []), ...(q2?.editions || [])])

    const sectionIds = uniq([...(q1.sectionIds || []), ...(q2.sectionIds || [])])

    return {
        ...q,
        sectionIds,
        editions
    }
}
