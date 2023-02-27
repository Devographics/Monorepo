import { TemplateFunction } from '../../types/surveys'

export const slider: TemplateFunction = ({ question, section }) => ({
    dbPath: `${section.id}.${question.id}.choices`,
    optionsAreNumeric: true,
    options: [...Array(9)].map((x, i) => ({ id: String(i) }))
})
