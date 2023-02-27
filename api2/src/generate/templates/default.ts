import { TemplateFunction } from '../../types/surveys'

export const defaultTemplateFunction: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}`
})
