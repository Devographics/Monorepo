import { TemplateFunction } from '../types'

export const happiness: TemplateFunction = ({ question, section }) => ({
    dbPath: `happiness.${section.id}`
})
