import { TemplateFunction } from '../../types/surveys'
import countries from '../../data/countries.yml'

export const country: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}`,
    options: countries.map((c: string) => ({ id: c }))
})
