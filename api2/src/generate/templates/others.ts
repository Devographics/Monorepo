import { TemplateFunction } from '../../types/surveys'

export const others: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id.replace('_others', '.others')}.normalized`
})
