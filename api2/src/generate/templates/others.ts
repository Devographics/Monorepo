import { TemplateFunction } from '../../types/surveys'

export const others: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.slug || section.id}.${question?.id?.replace(
        '_others',
        '.others'
    )}.normalized`
})
