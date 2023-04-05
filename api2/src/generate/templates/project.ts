import { TemplateFunction } from '../../types/surveys'

export const project: TemplateFunction = ({ question, section }) => {
    const rootSegment = section.template === 'tool' ? 'tools_others' : section.slug || section.id

    const dbPath = `${rootSegment}.${question?.id?.replace('_prenormalized', '.others')}.normalized`

    return {
        ...question,
        id: question?.id?.replace('_prenormalized', '_others') || 'placeholder',
        dbPath
    }
}
