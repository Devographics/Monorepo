import { TemplateFunction } from '../../types/surveys'

export const project: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.slug || section.id}.${question?.id?.replace(
        '_prenormalized',
        '.others'
    )}.normalized`
})
