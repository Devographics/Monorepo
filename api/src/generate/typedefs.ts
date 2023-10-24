import { generateAllEditionsEnumType } from '../graphql/templates/all_editions_enum'
import { generateFeaturesEnumType } from '../graphql/templates/features_enum'
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
import { generateToolsEnumType } from '../graphql/templates/tools_enum'
import { TypeDefTemplateOutput } from '../types'
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
    let typeObjects: TypeDefTemplateOutput[] = []

    // store all options for all fields contained in survey question outlines
    // const allQuestions: Question[] = []

    const addToTypeObjects = (typeDef: TypeDefTemplateOutput | null) => {
        if (typeDef) {
            typeObjects.push(typeDef)
        }
    }
    // type for all surveys
    let path = getPath({})
    addToTypeObjects(generateSurveysEnumType({ surveys, path }))
    addToTypeObjects(generateSurveysType({ surveys, path }))
    addToTypeObjects(generateAllEditionsEnumType({ surveys, path }))

    for (const survey of surveys) {
        path = getPath({ survey })
        // type for a single kind of survey (state of js, state of css, etc.)
        addToTypeObjects(generateSurveyType({ survey, path }))
        addToTypeObjects(generateSurveyEditionsEnumType({ survey, path }))
        addToTypeObjects(generateResponsesType({ survey, path }))
        addToTypeObjects(generateFeaturesEnumType({ survey, path }))
        addToTypeObjects(generateToolsEnumType({ survey, path }))

        for (const edition of survey.editions) {
            path = getPath({ survey, edition })
            // type for all editions of a survey
            addToTypeObjects(generateEditionType({ survey, edition, path }))

            if (!isEmpty(edition.sections)) {
                for (const section of edition.sections) {
                    path = getPath({ survey, edition, section })

                    // type for all sections of a survey edition
                    addToTypeObjects(
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
            groups,
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

        if (options || groups) {
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
