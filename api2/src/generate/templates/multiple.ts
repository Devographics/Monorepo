import { TemplateFunction } from '../../types/surveys'

export const multiple: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}.choices`
})
