import { NOT_APPLICABLE, NO_ANSWER } from '@devographics/constants'
import { Entity, OptionMetadata, QuestionMetadata, SectionMetadata } from '@devographics/types'
import { StringTranslator } from 'core/types'

export const getItemLabel = (options: {
    id: string | number
    label?: string
    // section: SectionMetadata
    // question: QuestionMetadata
    // option: OptionMetadata
    entity: Entity
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
    return { key, label }
}
