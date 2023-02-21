import { TemplateArguments } from '../types'

export const project = ({ question, section }: TemplateArguments) => ({
    dbPath: `${section.id}.${question.id.replace('_prenormalized', '.others')}.normalized`
})
