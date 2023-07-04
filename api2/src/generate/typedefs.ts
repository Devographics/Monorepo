import { generateAllEditionsEnumType } from '../graphql/templates/all_editions_enum'
import {
    generateFacetsType,
    generateFiltersType,
    generateEnumType,
    generateOptionType,
    generateFilterType,
    generateFieldType,
    generateSectionType,
    generateEditionType,
    generateSurveyEditionsEnumType,
    generateSurveyType,
    generateSurveysType,
    generateResponsesType,
    generateI18nContextsEnum,
    generateLocaleIDEnum,
    generateSurveysEnumType
} from '../graphql/templates/index'
import {} from '../graphql/templates/locale_id_enum'
import { SurveyApiObject, QuestionApiObject, TypeObject } from '../types/surveys'
import { getPath } from './helpers'
import isEmpty from 'lodash/isEmpty.js'

export const generateI18nTypeObjects = async ({}) => {
    let typeObjects = []
    let path = getPath({})
    typeObjects.push(await generateI18nContextsEnum({ path }))
    typeObjects.push(await generateLocaleIDEnum({ path }))
    return typeObjects
}
/*

Generate typeDefs corresponding to survey arborescence

*/
export const generateSurveysTypeObjects = async ({ surveys }: { surveys: SurveyApiObject[] }) => {
    let typeObjects = []

    // store all options for all fields contained in survey question outlines
    // const allQuestions: Question[] = []

    // type for all surveys
    let path = getPath({})
    typeObjects.push(generateSurveysEnumType({ surveys, path }))
    typeObjects.push(generateSurveysType({ surveys, path }))
    typeObjects.push(generateAllEditionsEnumType({ surveys, path }))

    for (const survey of surveys) {
        path = getPath({ survey })
        // type for a single kind of survey (state of js, state of css, etc.)
        typeObjects.push(generateSurveyType({ survey, path }))
        typeObjects.push(generateSurveyEditionsEnumType({ survey, path }))
        typeObjects.push(generateResponsesType({ survey, path }))

        for (const edition of survey.editions) {
            path = getPath({ survey, edition })
            // type for all editions of a survey
            typeObjects.push(generateEditionType({ survey, edition, path }))

            if (!isEmpty(edition.sections)) {
                for (const section of edition.sections) {
                    path = getPath({ survey, edition, section })

                    // type for all sections of a survey edition
                    typeObjects.push(
                        generateSectionType({
                            survey,
                            edition,
                            section,
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
    questionObjects: QuestionApiObject[]
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

        if (fieldTypeName && !typeObjects.find(t => t.typeName === fieldTypeName)) {
            if (typeDef) {
                typeObjects.push({ typeName: fieldTypeName, typeDef, typeType: 'field' })
            } else {
                const generatedTypeDef = await generateFieldType({ question })
                if (generatedTypeDef) {
                    typeObjects.push(generatedTypeDef)
                }
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
    surveys: SurveyApiObject[]
    questionObjects: QuestionApiObject[]
}) => {
    return surveys.map(survey => generateFiltersType({ survey, questionObjects }))
}

export const generateFacetsTypeObjects = ({
    surveys,
    questionObjects
}: {
    surveys: SurveyApiObject[]
    questionObjects: QuestionApiObject[]
}) => {
    return surveys.map(survey => generateFacetsType({ survey, questionObjects }))
}
