import { Entity } from '@devographics/types'
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
    generateSurveysEnumType,
    generateGenericFieldType,
    generateEntitiesTagsEnum
} from '../graphql/templates/index'
import {} from '../graphql/templates/locale_id_enum'
import { generateToolsEnumType } from '../graphql/templates/tools_enum'
import { RequestContext, TypeDefTemplateOutput } from '../types'
import { SurveyApiObject, QuestionApiObject, TypeObject } from '../types/surveys'
import { getPath } from './helpers'
import isEmpty from 'lodash/isEmpty.js'
import { generateDynamicEnumType } from '../graphql/templates/enumDynamic'

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

    addToTypeObjects(generateGenericFieldType({ surveys }))

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
    questionObjects,
    context
}: {
    questionObjects: QuestionApiObject[]
    context: RequestContext
}) => {
    const typeObjects: TypeObject[] = []
    let i = 0
    for (const questionObject of questionObjects) {
        i++
        if (i === 1 || i % 100 === 0) {
            console.log(
                `// ⏳ generating GraphQL typedefs for question ${i}/${questionObjects.length}…`
            )
        }
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
        } = questionObject

        const hasOptions = options || groups
        const isFreeform = ['text', 'longtext', 'textList'].includes(questionObject.template)

        if (hasOptions) {
            if (autogenerateFilterType && !typeObjects.find(t => t.typeName === filterTypeName)) {
                const filterType = generateFilterType({ question: questionObject })
                filterType && typeObjects.push(filterType)
            }

            if (autogenerateOptionType && !typeObjects.find(t => t.typeName === optionTypeName)) {
                const optionType = generateOptionType({ question: questionObject })
                optionType && typeObjects.push(optionType)
            }

            if (autogenerateEnumType && !typeObjects.find(t => t.typeName === enumTypeName)) {
                const enumType = generateEnumType({ question: questionObject })
                enumType && typeObjects.push(enumType)
            }
            if (!questionObject.optionTypeName) {
                questionObject.optionTypeName = fieldTypeName + 'Option'
            }
            if (!questionObject.enumTypeName) {
                questionObject.enumTypeName = fieldTypeName + 'ID'
            }
            if (!questionObject.filterTypeName) {
                questionObject.filterTypeName = fieldTypeName + 'Filter'
            }
        } else if (isFreeform) {
            // pass enumTypeName here but we'll only add it to questionObject
            // if dynamicEnum actually returns something
            const enumTypeName = fieldTypeName + 'ID'
            const enumType = await generateDynamicEnumType({
                question: { ...questionObject, enumTypeName },
                questionObjects,
                context
            })
            if (fieldTypeName === 'StateOfReactMetaFrameworksOthers') {
                console.log(questionObject)
            }
            if (enumType) {
                if (!questionObject.enumTypeName) {
                    questionObject.enumTypeName = enumTypeName
                }
                enumType && typeObjects.push(enumType)

                if (!questionObject.filterTypeName) {
                    questionObject.filterTypeName = fieldTypeName + 'Filter'
                }

                if (
                    autogenerateFilterType &&
                    !typeObjects.find(t => t.typeName === filterTypeName)
                ) {
                    const filterType = generateFilterType({ question: questionObject })
                    filterType && typeObjects.push(filterType)
                }
            }
        }

        if (fieldTypeName && !typeObjects.find(t => t.typeName === fieldTypeName)) {
            if (typeDef) {
                typeObjects.push({ typeName: fieldTypeName, typeDef, typeType: 'field' })
            } else {
                const generatedTypeDef = await generateFieldType({ question: questionObject })
                if (generatedTypeDef) {
                    typeObjects.push(generatedTypeDef)
                }
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
    return surveys
        .map(survey => generateFiltersType({ survey, questionObjects }))
        .filter(output => !!output)
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

export const generateEntitiesTypeObjects = ({ entities }: { entities: Entity[] }) => {
    return [generateEntitiesTagsEnum({ entities })]
}
