import {
    NO_MATCH,
    NO_ANSWER,
    OTHER_ANSWERS,
    CUTOFF_ANSWERS,
    OVERALL,
    INSUFFICIENT_DATA,
    OVERLIMIT_ANSWERS,
    NOT_APPLICABLE
} from '@devographics/constants'
import { StringTranslator } from '@devographics/react-i18n'
import { Entity } from '@devographics/types'

const predefinedKeys: { [key: string]: string } = {
    [NO_ANSWER]: 'charts.no_answer',
    [INSUFFICIENT_DATA]: 'charts.insufficient_data',
    [OVERALL]: 'charts.overall',
    [NO_MATCH]: 'charts.no_match',
    [CUTOFF_ANSWERS]: 'charts.cutoff_answers',
    [OTHER_ANSWERS]: 'charts.other_answers',
    [OVERLIMIT_ANSWERS]: 'charts.overlimit_answers'
}

export type LabelObject = {
    key?: string
    label: string
    shortLabel: string
    description?: string
}

const getFields = (item: any, fields: string[]) => {
    for (const field of fields) {
        if (item[field]) {
            return item[field] as string
        }
    }
    return undefined
}

export const getItemLabel = (options: {
    id: string | number
    label?: string
    // section: SectionMetadata
    // question: QuestionMetadata
    // option: OptionMetadata
    entity?: Entity
    getString: StringTranslator
    i18nNamespace?: string
    values?: any
    html?: boolean
}): LabelObject => {
    const {
        label: providedLabel,
        // section,
        // question,
        // option,
        entity,
        id,
        getString,
        i18nNamespace,
        values = {},
        html = false
    } = options

    let key, label, shortLabel, genericLabel, description

    if (providedLabel) {
        // if a label is provided, use that
        label = providedLabel
        shortLabel = providedLabel
    } else {
        // some ids have generic labels that work for all questions
        if (id === NOT_APPLICABLE) {
            genericLabel = getString('options.na')?.t
        }

        // else, try using an i18n key
        const defaultKey = `options.${i18nNamespace}.${id}`
        const predefinedKey = predefinedKeys[id]

        key = predefinedKey || defaultKey
        const descriptionKey = `${key}.description`

        const i18nLabelObject = getString(key, values)
        const i18nLabel = getFields(i18nLabelObject, [html ? 'tHtml' : 'tClean', 't'])
        const entityName =
            entity && getFields(entity, ['alias', html ? 'nameHtml' : 'nameClean', 'name'])

        const shortLabelObject = getString(key + '.short', values, i18nLabel)

        const i18nDescriptionObject = getString(descriptionKey, values)
        const i18nDescription = getFields(i18nDescriptionObject, [html ? 'tHtml' : 'tClean', 't'])
        const entityDescription =
            entity &&
            getFields(entity, [html ? 'descriptionHtml' : 'descriptionClean', 'description'])

        label = String(i18nLabel || entityName || genericLabel || id)
        shortLabel = getFields(shortLabelObject, [html ? 'tHtml' : 'tClean', 't']) || label
        description = i18nDescription || entityDescription
    }
    return { key, label, shortLabel, description }
}
