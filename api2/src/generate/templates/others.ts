import { TemplateArguments } from '../types'

export const others = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id.replace('_others', '.others')}.normalized`
})
