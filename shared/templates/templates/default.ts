import { TemplateFunction } from '@devographics/types'

export const defaultTemplateFunction: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbPath: `${section.id}.${question.id}`
})
