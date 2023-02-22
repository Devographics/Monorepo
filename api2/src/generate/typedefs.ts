import {
    generateOptionType,
    generateEnumType,
    generateFilterType,
    generateSurveysType,
    generateSurveyType,
    generateEditionType,
    generateSectionType,
    generateFieldType,
    generateSurveyEditionsEnumType,
    generateFiltersType,
    generateFacetsType
} from './graphql_templates'
import { Survey, QuestionObject, TypeObject } from './types'
import { getPath, getSectionQuestionObjects, mergeSections } from './helpers'
import isEmpty from 'lodash/isEmpty.js'

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

            const allSections = mergeSections(edition.sections, edition.apiSections)

            if (!isEmpty(allSections)) {
                for (const section of allSections) {
                    path = getPath({ survey, edition, section })

                    // make sure to get "rich" questions from questionObjects
                    // and not "raw" questions from edition.questions
                    const sectionQuestionObjects = getSectionQuestionObjects({
                        survey,
                        section,
                        edition,
                        questionObjects
                    })

                    // type for all sections of a survey edition
                    typeObjects.push(
                        generateSectionType({
                            survey,
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
        const {
            options,
            fieldTypeName,
            optionTypeName,
            autogenerateOptionType = true,
            enumTypeName,
            autogenerateEnumType = true,
            filterTypeName,
            autogenerateFilterType = true,
            typeDef
        } = question

        if (!typeObjects.find(t => t.typeName === fieldTypeName)) {
            if (typeDef) {
                typeObjects.push({ typeName: fieldTypeName, typeDef, typeType: 'field' })
            } else {
                typeObjects.push(generateFieldType({ question }))
            }
        }

        if (options) {
            if (autogenerateFilterType && !typeObjects.find(t => t.typeName === filterTypeName)) {
                const filterType = generateFilterType({ question })
                filterType && typeObjects.push(filterType)
            }
            if (autogenerateOptionType && !typeObjects.find(t => t.typeName === optionTypeName)) {
                const optionType = generateOptionType({ question })
                optionType && typeObjects.push(optionType)
            }
            if (autogenerateEnumType && !typeObjects.find(t => t.typeName === enumTypeName)) {
                const enumType = generateEnumType({ question })
                enumType && typeObjects.push(enumType)
            }
        }
    }
    return typeObjects
}

export const generateFiltersTypeObjects = ({
    surveys,
    questionObjects
}: {
    surveys: Survey[]
    questionObjects: QuestionObject[]
}) => {
    return surveys.map(survey => generateFiltersType({ survey, questionObjects }))
}

export const generateFacetsTypeObjects = ({
    surveys,
    questionObjects
}: {
    surveys: Survey[]
    questionObjects: QuestionObject[]
}) => {
    return surveys.map(survey => generateFacetsType({ survey, questionObjects }))
}
