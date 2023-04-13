import { TemplateFunction } from '../../types/surveys'

export const number: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}.choices`
})
