import { TemplateFunction } from '@devographics/types'

export const opinion: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    dbSuffix: null,
    dbPath: `${section.id}.${question.id}`,
    optionsAreNumeric: true,
    options: [...Array(5)].map((x, i) => ({ id: String(i) }))
})
