import { OptionGroup } from '@devographics/types'
import { loadOrGetParsedSurveys } from '../load/surveys'
import {
    Survey,
    Edition,
    Section,
    Question,
    QuestionApiObject,
    Option,
    QuestionTemplateOutput,
    SectionApiObject,
    EditionApiObject,
    SurveyApiObject,
    ResponseEditionData,
    Bucket
} from '../types/surveys'
import { templates } from './question_templates'
import uniq from 'lodash/uniq.js'

export const graphqlize = (str: string) => capitalizeFirstLetter(snakeToCamel(str))

export const capitalizeFirstLetter = (str: string) =>
    str && str.charAt(0).toUpperCase() + str.slice(1)

export const snakeToCamel = (str: string) =>
    str &&
    str
        .toLowerCase()
        .replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''))

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
}): QuestionTemplateOutput => {
    const { survey, edition, section, question } = options
    const template = question.template || section.template
    const id = question.id || 'placeholder'
    let output = { ...question, id }
    if (template) {
        const templateFunction = templates[template]
        if (templateFunction) {
            output = { ...output, template, ...templateFunction(options) }
        } else {
            console.log(`// template ${template} not found!`)
            console.log(question)
            output = { ...output, template }
        }
    } else {
        console.warn(`Question "${edition.id}/${question.id}" does not have a template specified.`)
    }
    return output
}

export const getPath = ({
    survey,
    edition,
    section,
    question,
    suffix
}: {
    survey?: SurveyApiObject
    edition?: EditionApiObject
    section?: SectionApiObject
    question?: QuestionApiObject
    suffix?: string
}) => {
    const pathSegments = ['root']
    const segments = [survey, edition, section, question]
    segments.forEach(segment => {
        if (segment?.id) {
            pathSegments.push(segment.id)
        }
    })
    return pathSegments.join('.')
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
export const mergeSections = (sections1: Section[] = [], sections2: Section[] = []) => {
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

export const getSectionItems = (section: SectionApiObject, type: 'tools' | 'features') =>
    type === 'tools' ? getSectionTools(section) : getSectionFeatures(section)
// TODO: do this better
export const getSectionFeatures = (section: SectionApiObject) =>
    section?.questions?.filter(q => ['feature', 'featurev3'].includes(q.template))
export const getSectionTools = (section: SectionApiObject) =>
    section?.questions?.filter(q => q.template === 'tool')

export const getEditionItems = (edition: EditionApiObject, type: 'tools' | 'features') => {
    let items: QuestionApiObject[] = []
    for (const section of edition.sections) {
        items = [...items, ...getSectionItems(section, type)]
    }
    return items
}

export const formatNumericOptions = <T extends Option | OptionGroup>(options: T[]) =>
    options.map(option => ({ ...option, id: `value_${option.id}` }))

// convert an option back into a number
export const convertNumericOption = (value: string) => Number(value.replace('value_', ''))

export const getFiltersTypeName = (surveyId: string) => graphqlize(surveyId) + 'Filters'
export const getFacetsTypeName = (surveyId: string) => graphqlize(surveyId) + 'Facets'

export const getContentType = (question: QuestionTemplateOutput) =>
    question.optionsAreNumeric ? 'number' : 'string'

export const getEditionById = async (editionId: string) => {
    const surveys = await loadOrGetParsedSurveys()
    const allEditions = surveys.map(s => s.editions).flat()
    const edition = allEditions.find(e => e.id === editionId)
    if (!edition) {
        throw new Error(`getEditionById: could not find edition with id ${editionId}`)
    }
    return edition
}
