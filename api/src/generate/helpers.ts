import { ApiSectionTypes, OptionGroup } from '@devographics/types'
import { loadOrGetSurveys } from '../load/surveys'
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
    SurveyApiObject
} from '../types/surveys'
import { templates } from './question_templates'
import uniq from 'lodash/uniq.js'
import { RequestContext } from '../types'
import { ALL_TOOLS_SECTION, FEATURES_TYPE, TOOLS_TYPE } from '@devographics/constants'
import { missingTemplates } from '../server'

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
            const newOption = { ...existingOption, ...o2, editions: mergedEditions }
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
    context: RequestContext
}): QuestionTemplateOutput => {
    const { survey, edition, section, question, context } = options
    const template = question.template || section.template
    const id = question.id || 'placeholder'
    let output: QuestionTemplateOutput = { ...question, id }
    if (template) {
        const templateFunction = templates[template]
        if (templateFunction) {
            output = { ...output, template, ...templateFunction(options) }
        } else {
            console.log(`// template ${template} not found! (${edition.id})`)
            console.log(question)
            missingTemplates.push({
                id: question.id,
                editionId: edition.id,
                template: question.template
            })
            output = { ...output, template, templateMissing: true }
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

// TODO: do this better
export const getSectionType = (section: SectionApiObject) => {
    if (
        ['tools', 'libraries', ALL_TOOLS_SECTION].includes(section.id) ||
        (section.template && ['tool', 'toolv3'].includes(section.template))
    ) {
        return TOOLS_TYPE
    } else {
        return FEATURES_TYPE
    }
}

export const getSectionItems = (section: SectionApiObject, type: ApiSectionTypes) =>
    type === 'tools' ? getSectionTools(section) : getSectionFeatures(section)
// TODO: do this better
export const getSectionFeatures = (section: SectionApiObject) =>
    section?.questions?.filter(q => ['feature', 'featurev3'].includes(q.template))

export const getSectionTools = (section: SectionApiObject) => {
    return section?.questions?.filter(q => ['tool', 'toolv3'].includes(q.template))
}

export const getEditionItems = (edition: Edition | EditionApiObject, type: ApiSectionTypes) => {
    let items: QuestionApiObject[] = []
    if (!Array.isArray(edition.sections)) {
        return []
    }
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
    const { surveys } = await loadOrGetSurveys()
    const allEditions = surveys.map(s => s.editions).flat()
    const edition = allEditions.find(e => e.id === editionId)
    if (!edition) {
        throw new Error(`getEditionById: could not find edition with id ${editionId}`)
    }
    return edition
}

export const getGeneralMetadata = ({ context }: { context: RequestContext }) => {
    // TODO: import this from YAML
    return {
        creators: ['stephanie_walter', 'afor_digital', 'codebar', 'shruti_kapoor'].map(id => ({
            id
            // entity: await getEntity({ id, context })
        }))
    }
}

/*

If only lowerBound/upperBound are defined on groups, 
also calculate and add average values

*/
export const addGroupsAverages = (groups: OptionGroup[]) => {
    return groups.map(group => {
        const { lowerBound, upperBound, average } = group
        if (lowerBound && upperBound && !average) {
            group.average = lowerBound + (upperBound - lowerBound) / 2
        }
        return group
    })
}

/*

If option value is defined, copy it over to average field as well

*/
export const addOptionsAverages = (options: Option[]) => {
    return options.map(option => {
        if (option.value && !option.average) {
            option.average = option.value
        }
        return option
    })
}

/*

Disallow some fields because their contents would not be valid GraphQL
enum members. In the future use normalization to make sure that data
is properly formatted in the database itself.

*/
export const disallowFields = [
    'version',
    'locale',
    'past_same_survey_count',
    'created_at_date',
    'css_proficiency',
    'javascript_proficiency',
    'backend_proficiency',
    'future_same_survey_count',
    'browser'
]
