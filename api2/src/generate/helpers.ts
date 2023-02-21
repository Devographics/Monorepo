import { Survey, Edition, Section, ApiSection, Question, QuestionObject, Option } from './types'
import globalQuestions from './global_questions.yml'
import { templates } from './question_templates'
import uniq from 'lodash/uniq.js'
import { getQuestionObject } from './generate'

export const graphqlize = (str: string) => capitalizeFirstLetter(snakeToCamel(str))

export const capitalizeFirstLetter = (str: string) =>
    str && str.charAt(0).toUpperCase() + str.slice(1)

export const snakeToCamel = (str: string) =>
    str &&
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

    if (template) {
        const templateFunction = templates[template]
        if (templateFunction) {
            return { ...question, template, ...templateFunction(options) }
        } else {
            console.log(`// template ${template} not found!`)
            console.log(question)
            return { ...question, template }
        }
    }
}

export const getPath = ({
    survey,
    edition,
    section,
    question,
    suffix
}: {
    survey?: Survey
    edition?: Edition
    section?: Section
    question?: Question
    suffix?: string
}) => {
    const pathSegments = ['root']
    const segments = [survey, edition, section, question]
    segments.forEach(segment => {
        if (segment) {
            pathSegments.push(segment.id)
        }
    })
    return pathSegments.join('.')
}

export const getSectionQuestionObjects = ({
    survey,
    section,
    edition,
    questionObjects
}: {
    survey: Survey
    section: Section
    edition: Edition
    questionObjects: QuestionObject[]
}) => {
    const results = questionObjects.filter(
        q =>
            q.sectionIds &&
            q.sectionIds.includes(section.id) &&
            q.editions &&
            q.editions.includes(edition.id) &&
            q.includeInApi !== false
    )
    return results
}

/*

Merge

[
    { id: user_info, questions: [a, b, c]}
]

And


[
    { id: user_info, questions: [d, e, f]},
    { id: resources, questions: [x, y, z]}
]

Into


[
    { id: user_info, questions: [a, b, c, d, e, f]}
    { id: resources, questions: [x, y, z]}
]

*/
export const mergeSections = (
    sections1: Section[] | ApiSection[] = [],
    sections2: Section[] | ApiSection[] = []
) => {
    const sections = [...sections1]
    for (const section of sections2) {
        const existingSectionIndex = sections.findIndex(s => s.id === section.id)
        const existingSection = sections[existingSectionIndex]
        if (existingSection) {
            const mergedSection = {
                ...existingSection,
                ...section,
                questions: [...existingSection.questions, ...section.questions]
            }
            sections[existingSectionIndex] = mergedSection
        } else {
            sections.push(section)
        }
    }
    return sections
}
