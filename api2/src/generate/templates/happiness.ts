import { TemplateArguments } from '../types'

export const happiness = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id.replace('_happiness', '.happiness')}`
})
