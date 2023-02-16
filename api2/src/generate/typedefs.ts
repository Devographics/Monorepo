import { Survey, Edition, Section, Question, Field, Option } from '../types'
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
import { TypeObject } from './types'

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

            if (edition.sections) {
                for (const section of edition.sections) {
                    // make sure to get "rich" questions from questionObjects
                    // and not "raw" questions from edition.questions
                    const sectionQuestionObjects = questionObjects.filter(
                        q => q.sectionId === section.id && q.editions.includes(edition.surveyId)
                    )

                    // type for all sections of a survey edition
                    typeObjects.push(
                        generateSectionType({
                            edition,
                            section,
                            questions: sectionQuestionObjects
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
