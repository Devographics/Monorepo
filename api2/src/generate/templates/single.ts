import { TemplateFunction } from '../types'

export const single: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}.choices`
})
