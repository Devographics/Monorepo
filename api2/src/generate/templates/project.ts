import { TemplateFunction } from '../../types/surveys'

export const project: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id.replace('_prenormalized', '.others')}.normalized`
})
