import { TemplateFunction } from '../../types/surveys'

export const multiple: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.slug || section.id}.${question.id}.choices`
})
