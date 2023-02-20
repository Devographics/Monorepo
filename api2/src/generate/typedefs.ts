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
import { Survey, QuestionObject, TypeObject } from './types'
import { getPath, getSectionQuestionObjects } from './helpers'

/*

Generate typeDefs corresponding to survey arborescence

*/
export const generateSurveysTypeObjects = async ({
    surveys,
    questionObjects
}: {
    surveys: Survey[]
    questionObjects: QuestionObject[]
}) => {
    let typeObjects = []

    // store all options for all fields contained in survey question outlines
    // const allQuestions: Question[] = []

    // type for all surveys
    let path = getPath({})
    typeObjects.push(generateSurveysType({ surveys, path }))

    for (const survey of surveys) {
        path = getPath({ survey })
        // type for a single kind of survey (state of js, state of css, etc.)
        typeObjects.push(generateSurveyType({ survey, path }))
        typeObjects.push(generateSurveyEditionsEnumType({ survey, path }))

        for (const edition of survey.editions) {
            path = getPath({ survey, edition })
            // type for all editions of a survey
            typeObjects.push(generateEditionType({ survey, edition, path }))

            if (edition.sections) {
                for (const section of edition.sections) {
                    path = getPath({ survey, edition, section })

                    // make sure to get "rich" questions from questionObjects
                    // and not "raw" questions from edition.questions
                    const sectionQuestionObjects = getSectionQuestionObjects({
                        section,
                        edition,
                        questionObjects
                    })

                    // type for all sections of a survey edition
                    typeObjects.push(
                        generateSectionType({
                            edition,
                            section,
                            questions: sectionQuestionObjects,
                            path
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
    questionObjects: QuestionObject[]
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
