import { TemplateFunction } from '../../types/surveys'

export const opinion: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}`,
    optionsAreNumeric: true,
    options: [...Array(5)].map((x, i) => ({ id: String(i) }))
})
