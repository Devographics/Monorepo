import { TemplateFunction } from '@devographics/types'

export const project: TemplateFunction = ({ question, section }) => {
    const rootSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id

    const questionId = question?.id?.replace('_prenormalized', '.others')

    const dbPath = `${rootSegment}.${questionId}.normalized`

    return {
        ...question,
        id: questionId || 'placeholder',
        dbSuffix: 'prenormalized',
        dbPath
    }
}
