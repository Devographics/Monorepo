import { TemplateFunction } from '../../types/surveys'

export const project: TemplateFunction = ({ question, section }) => ({
    ...question,
    id: question?.id?.replace('_prenormalized', '_others') || 'placeholder',
    dbPath: `${section.slug || section.id}_others.${question?.id?.replace(
        '_prenormalized',
        '.others'
    )}.normalized`
})
