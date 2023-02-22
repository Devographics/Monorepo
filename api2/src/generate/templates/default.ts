import { TemplateFunction } from '../types'

export const defaultTemplateFunction: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}`
})
