import { TemplateArguments } from '../types'
import { TOOLS_OPTIONS } from '../../constants'

export const tool = ({ question }: TemplateArguments) => ({
    dbPath: `tools.${question.id}.experience`,
    options: TOOLS_OPTIONS.map(id => ({
        id
    })),
    fieldTypeName: 'Tool',
    filterTypeName: 'ToolExperienceFilter',
    optionTypeName: 'ToolExperienceOption',
    enumTypeName: 'ToolExperienceID'
})
