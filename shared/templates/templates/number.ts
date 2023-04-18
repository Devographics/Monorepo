import { TemplateFunction } from '@devographics/types'

export const number: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbSuffix: 'choices',
    dbPath: `${section.id}.${question.id}.choices`
})
