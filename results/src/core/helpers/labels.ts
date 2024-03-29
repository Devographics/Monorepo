import {
    NO_MATCH,
    NO_ANSWER,
    OTHER_ANSWERS,
    CUTOFF_ANSWERS,
    OVERALL,
    INSUFFICIENT_DATA,
    OVERLIMIT_ANSWERS
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
}) => {
    const {
        label: providedLabel,
        // section,
        // question,
        // option,
        entity,
        id,
        getString,
        i18nNamespace,
        values = {}
    } = options

    let key, label, shortLabel

    if (providedLabel) {
        // if a label is provided, use that
        label = providedLabel
        shortLabel = providedLabel
    } else {
        // else, try using an i18n key
        const defaultKey = `options.${i18nNamespace}.${id}`
        const predefinedKey = predefinedKeys[id]

        key = predefinedKey || defaultKey

        const i18nLabelObject = getString(key, values)
        const i18nLabel = i18nLabelObject.tClean || i18nLabelObject.t

        const shortLabelObject = getString(key + '.short', values, i18nLabel)

        const entityName = entity && (entity.nameClean || entity.name)

        label = String(i18nLabel || entityName || id)
        shortLabel = String(shortLabelObject.tClean || shortLabelObject.t || label)
    }
    return { key, label, shortLabel }
}
