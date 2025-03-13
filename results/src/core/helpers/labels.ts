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
    [NOT_APPLICABLE]: 'options.na',
    [NO_ANSWER]: 'charts.no_answer',
    [INSUFFICIENT_DATA]: 'charts.insufficient_data',
    [OVERALL]: 'charts.overall',
    [NO_MATCH]: 'charts.no_match',
    [CUTOFF_ANSWERS]: 'charts.cutoff_answers',
    [OTHER_ANSWERS]: 'charts.other_answers',
    [OVERLIMIT_ANSWERS]: 'charts.overlimit_answers'
}

enum LabelSourcesEnum {
    ID = 'id',
    PREDEFINED = 'predefined',
    ENTITY = 'entity',
    ENTITY_I18N = 'entity_i18n',
    I18N = 'i18n',
    PROVIDED = 'provided'
}

export type LabelObject = {
    key?: string
    label: string
    shortLabel: string
    descriptionKey?: string
    description?: string
    values?: any
    source: LabelSourcesEnum
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

    // 1. use id as default
    let key = String(id),
        label = String(id),
        shortLabel,
        description,
        descriptionKey,
        source = LabelSourcesEnum.ID

    // 2. if this is a predefined key, use that
    if (Object.keys(predefinedKeys).includes(String(id))) {
        // 2. this is special field with a predefined key
        key = predefinedKeys[id]
        label = getString(key)?.t
        shortLabel = label
        source = LabelSourcesEnum.PREDEFINED
    }

    // 3. look for entity metadata
    if (entity) {
        const entityLabel = getFields(entity, [
            'alias',
            html ? 'nameHtml' : 'nameClean',
            'name'
        ]) as string
        if (entityLabel) {
            label = entityLabel
            key = 'entity'
            source = LabelSourcesEnum.ENTITY
        }
        const entityDescription = getFields(entity, [
            html ? 'descriptionHtml' : 'descriptionClean',
            'description'
        ])
        if (entityDescription) {
            description = entityDescription
        }
    }

    // 4. look for entity translation
    if (entity) {
        const entityLabelKey = `entities.${id}.name`
        const entityLabelObject = getString(entityLabelKey, { values })
        if (!entityLabelObject.missing) {
            key = entityLabelKey
            label = getFields(entityLabelObject, [html ? 'tHtml' : 'tClean', 't']) as string
            source = LabelSourcesEnum.ENTITY_I18N
        }

        const entityDescriptionKey = `entities.${id}.description`
        const entityDescriptionObject = getString(entityDescriptionKey, { values })
        if (!entityDescriptionObject.missing) {
            descriptionKey = entityDescriptionKey
            description = getFields(entityDescriptionObject, [
                html ? 'tHtml' : 'tClean',
                't'
            ]) as string
        }
    }

    // 5. look for regular translation

    // TODO: get rid of these exceptions?
    // note: make an exception for "features" and "tools" namespaces
    // because they do not use the "options." prefix
    let namespace
    if (i18nNamespace === 'tools') {
        namespace = 'tools'
    } else if (i18nNamespace === 'features') {
        namespace = 'features'
    } else {
        namespace = `options.${i18nNamespace}`
    }

    const i18nLabelKey = `${namespace}.${id}`
    const i18nLabelObject = getString(i18nLabelKey, { values })
    if (!i18nLabelObject.missing) {
        key = i18nLabelKey
        label = getFields(i18nLabelObject, [html ? 'tHtml' : 'tClean', 't']) as string
        source = LabelSourcesEnum.I18N
    }

    const i18nShortObject = getString(`${i18nLabelKey}.short`, { values })
    if (!i18nShortObject.missing) {
        shortLabel = getFields(i18nShortObject, [html ? 'tHtml' : 'tClean', 't']) as string
    }

    const i18nDescriptionKey = `${key}.description`
    const i18nDescriptionObject = getString(i18nDescriptionKey, { values })
    if (!i18nDescriptionObject.missing) {
        key = i18nDescriptionKey
        description = getFields(i18nDescriptionObject, [html ? 'tHtml' : 'tClean', 't']) as string
    }

    // 6. use provided label
    if (providedLabel) {
        // 1. if a label is provided, use that
        key = 'provided'
        label = providedLabel
        shortLabel = providedLabel
        source = LabelSourcesEnum.PROVIDED
    }

    // if shortLabel has not been defined, just set it to the label
    if (!shortLabel) {
        shortLabel = label
    }
    const result = { id, key, label, shortLabel, descriptionKey, description, values, source }

    return result
}
