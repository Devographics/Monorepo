import { TemplateArguments } from '../types'

export const multiple = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id}.choices`
})
