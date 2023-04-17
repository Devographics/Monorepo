import { TemplateFunction } from '@devographics/types'

export const single: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbSuffix: 'choices',
    dbPath: `${section.id}.${question.id}.choices`
})
