import { TemplateFunction } from '@devographics/types'

export const multiple: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbSuffix: 'choices',
    dbPath: `${section.slug || section.id}.${question.id}.choices`
})
