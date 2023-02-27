import { TemplateFunction } from '../../types/surveys'

export const single: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}.choices`
})
