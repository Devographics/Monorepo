import { TemplateFunction } from '../../types/surveys'

export const happiness: TemplateFunction = ({ question, section }) => ({
    dbPath: `happiness.${section.id}`
})
