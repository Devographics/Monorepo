import { Survey, Edition, Section, Question, Field, Option } from '../types'
import globalQuestions from './global_questions.yml'
import { templates } from './templates'
import uniq from 'lodash/uniq.js'

export const graphqlize = (str: string) => capitalizeFirstLetter(snakeToCamel(str))

export const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const snakeToCamel = (str: string) =>
    str
        .toLowerCase()
        .replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''))

export const getGlobalQuestions = () => {
    return globalQuestions as Question[]
}

/*

Take: 

[
    { id: 'foo', editions: ['js2021', 'js2022'] },
    { id: 'bar', editions: ['js2020', 'js2021'] },
]

And


[
    { id: 'foo', editions: ['js2023'] },
    { id: 'baz', editions: ['js2023'] },
]

And merge them into: 


[
    { id: 'foo', editions: ['js2021', 'js2022', 'js2023'] },
    { id: 'bar', editions: ['js2020', 'js2021'] },
    { id: 'baz', editions: ['js2023'] },
]

*/
export const mergeOptions = (options1: Option[], options2: Option[]) => {
    if (!Array.isArray(options1) || !Array.isArray(options2)) {
        return
    }
    const options: Option[] = [...options1]
    options2.forEach(o2 => {
        const existingOptionIndex = options.findIndex(o => o.id === o2.id)
        const existingOption = options[existingOptionIndex]
        if (existingOption) {
            const mergedEditions = uniq([
                ...(existingOption?.editions || []),
                ...(o2?.editions || [])
            ])
            const newOption = { ...existingOption, editions: mergedEditions }
            options[existingOptionIndex] = newOption
        } else {
            options.push(o2)
        }
    })
    return options
}

export const applyQuestionTemplate = (options: {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}) => {
    const { survey, edition, section, question } = options
    const template = question.template || section.template

    const templateFunction = templates[template]
    if (templateFunction) {
        return { ...question, template, ...templateFunction(options) }
    } else {
        console.log(`// template ${template} not found!`)
        return { ...question, template }
    }
}
