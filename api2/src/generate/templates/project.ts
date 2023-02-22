import { TemplateFunction } from '../types'

export const project: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id.replace('_prenormalized', '.others')}.normalized`
})
