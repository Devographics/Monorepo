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
    getContentType
} from './helpers'
import {
    generateSurveysTypeObjects,
    generateQuestionsTypeObjects,
    generateFiltersTypeObjects,
    generateFacetsTypeObjects,
    generateI18nTypeObjects
} from './typedefs'
import uniq from 'lodash/uniq.js'

/*

Parse surveys and generate a "rich" version of the outline tree

*/
export const parseSurveys = ({ surveys }: { surveys: Survey[] }): SurveyApiObject[] => {
    return surveys.map(survey => getSurveyObject({ survey }))
}

// Take a Survey and return a SurveyApiObject
export const getSurveyObject = ({ survey }: { survey: Survey }): SurveyApiObject => {
    return {
        ...survey,
        editions: survey.editions.map(edition => getEditionObject({ survey, edition }))
    }
}

// Take an Edition and return an EditionApiObject
export const getEditionObject = ({
    survey,
    edition
}: {
    survey: Survey
    edition: Edition
}): EditionApiObject => {
    const { apiSections, sections, ...rest } = edition
    const allSections = mergeSections(edition.sections, edition.apiSections).map(section =>
        getSectionObject({ survey, edition, section })
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
export const getSectionObject = ({
    survey,
    edition,
    section
}: {
    survey: Survey
    edition: Edition
    section: Section
}): SectionApiObject => {
    const questions = section.questions.map(question => ({
        ...getQuestionObject({ survey, edition, section, question }),
        editionId: edition.id,
        edition,
        section
    }))
    const apiOnly = questions.every(q => q.apiOnly)
    return {
        ...section,
        questions,
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
    questionObjects
}: {
    surveys: SurveyApiObject[]
    questionObjects: QuestionApiObject[]
}): Promise<TypeObject[]> => {
    const i18nTypeObjects = await generateI18nTypeObjects({
        surveys
    })
    const surveysTypeObjects = await generateSurveysTypeObjects({
        surveys
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
        ...i18nTypeObjects,
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

*/
export const getQuestionObjects = ({ surveys }: { surveys: Survey[] }) => {
    let allQuestionObjects: QuestionApiObject[] = []

    for (const survey of surveys) {
        const surveyQuestionObjects: QuestionApiObject[] = []
        for (const edition of survey.editions) {
            const allSections = mergeSections(edition.sections, edition.apiSections)

            if (allSections) {
                for (const section of allSections) {
                    for (const question of section?.questions) {
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
        sectionIndex: edition.sections.findIndex(s => s.id === section.id), // just a simple way to group questions together when belonging to same section
        surveyId: survey.id,
        editions: [edition.id],
        ...templateObject
    }

    let questionObject: QuestionApiObject = {
        ...templateOutputWithExtraFields,
        ...question
    }

    questionObject.contentType = getContentType(questionObject)

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
