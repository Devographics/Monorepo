import { TemplateFunction } from '../../types/surveys'

export const single: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}.choices`
})
