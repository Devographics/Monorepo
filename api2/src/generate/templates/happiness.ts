import { TemplateFunction } from '../types'

export const happiness: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id.replace('_happiness', '.happiness')}`
})
