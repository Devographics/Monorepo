import { TemplateFunction } from '../types'

export const opinion: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}`,
    optionsAreNumeric: true,
    options: [...Array(5)].map((x, i) => ({ id: String(i) }))
})
