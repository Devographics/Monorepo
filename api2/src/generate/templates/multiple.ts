import { TemplateFunction } from '../types'

export const multiple: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}.choices`
})
