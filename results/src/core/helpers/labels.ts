import {
    NO_MATCH,
    NO_ANSWER,
    OTHER_ANSWERS,
    CUTOFF_ANSWERS,
    OVERALL,
    INSUFFICIENT_DATA
} from '@devographics/constants'
import { StringTranslator } from '@devographics/react-i18n'
import { Entity } from '@devographics/types'

export const getItemLabel = (options: {
    id: string | number
    label?: string
    // section: SectionMetadata
    // question: QuestionMetadata
    // option: OptionMetadata
    entity?: Entity
    getString: StringTranslator
    i18nNamespace?: string
    extraLabel?: string
    values?: any
}) => {
    const {
        label: label_,
        // section,
        // question,
        // option,
        entity,
        id,
        getString,
        i18nNamespace,
        extraLabel,
        values = {}
    } = options

    let key, label
    if (id === NO_ANSWER) {
        key = 'charts.no_answer'
        label = getString(key).t
    } else if (id === INSUFFICIENT_DATA) {
        key = 'charts.insufficient_data'
        label = getString(key).t
    } else if (id === OVERALL) {
        key = 'charts.overall'
        label = getString(key).t
    } else if (id === NO_MATCH) {
        key = 'charts.no_match'
        label = getString(key).t
    } else if (id === CUTOFF_ANSWERS) {
        key = 'charts.cutoff_answers'
        label = getString(key).t
    } else if (id === OTHER_ANSWERS) {
        key = 'charts.other_answers'
        label = getString(key).t
    } else {
        key = i18nNamespace === 'features' ? `features.${id}` : `options.${i18nNamespace}.${id}`

        const s = getString(key, values)

        if (label_) {
            label = label_
        } else if (!s.missing) {
            const translatedLabel = s.tClean || s.t
            label = translatedLabel
        } else if (entity) {
            label = entity.nameClean || entity.name
        } else {
            label = id
        }
    }
    if (extraLabel) {
        label = `${label}, ${extraLabel}`
    }
    const shortLabelObject = getString(key + '.short', values, label?.toString())
    const shortLabel = shortLabelObject.tClean || shortLabelObject.t
    return { key, label, shortLabel }
}
