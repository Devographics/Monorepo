import { TemplateFunction } from '@devographics/types'

export const number: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}.choices`
})
