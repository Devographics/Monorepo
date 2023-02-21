import { TemplateArguments } from '../types'

export const single = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id}.choices`
})
