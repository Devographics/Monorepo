import { TemplateFunction } from '../../types/surveys'

export const defaultTemplateFunction: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}`
})
