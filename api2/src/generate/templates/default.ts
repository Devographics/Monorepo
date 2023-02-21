import { TemplateArguments } from '../types'

export const defaultTemplateFunction = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id}`
})
