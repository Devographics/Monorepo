import { Entity } from '@types/index'

export const getSectionLabel = ({ getString, id }) => {
    const s = getString(`explorer.sections.${id}`)
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
    getString: any
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
    sectionId,
    questionId,
    optionId,
    isShort = false
}: {
    getString: any
    sectionId: string
    questionId: string
    optionId: string
    isShort: boolean
}) => {
    const middleSegment = sectionId === 'demographics' ? questionId : sectionId
    const key = `options.${middleSegment}.${optionId}${isShort ? '.short' : ''}`
    const s = getString(key)
    return s.t
}
