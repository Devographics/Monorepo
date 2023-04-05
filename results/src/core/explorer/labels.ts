import { NO_ANSWER } from '@devographics/constants'
import { Entity } from '@devographics/types'
import { StringTranslator } from 'core/types'

export const getSectionLabel = ({ getString, id }) => {
    const s = getString(`sections.${id}.title`)
    return s.t
}

export const getGroupLabel = ({ getString, section, id }) => {
    const key = id === 'all_fields' ? 'explorer.all_fields' : `sections.${id}.title`
    return getString(key)?.t
}

export const getQuestionLabel = ({
    getString,
    sectionId,
    questionId,
    entities
}: {
    getString: StringTranslator
    sectionId: string
    questionId: string
    entities: Entity[]
}) => {
    const entity = entities?.find(e => e.id === questionId)
    if (entity) {
        return entity.nameClean || entity.name
    } else {
        const sectionSegment = sectionId === 'demographics' ? 'user_info' : sectionId
        const key = `${sectionSegment}.${questionId}`
        const s = getString(key)
        return s.t
    }
}

export const getOptionLabel = ({
    getString,
    questionId,
    optionId
}: {
    getString: StringTranslator
    questionId: string
    optionId: string
}) => {
    const key = optionId === NO_ANSWER ? 'charts.no_answer' : `options.${questionId}.${optionId}`
    const s = getString(key)
    // use short version if it exists, with regular version as fallback
    const short = getString(`${key}.short`, {}, s.t)
    return short.t
}
