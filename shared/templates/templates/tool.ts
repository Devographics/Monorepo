import { TemplateFunction } from '@devographics/types'
import { TOOLS_OPTIONS } from '@devographics/constants'

export const tool: TemplateFunction = ({ survey, question }) => {
    return {
        ...question,
        id: question.id || 'placeholder',
        dbSuffix: 'experience',
        dbPath: `tools.${question.id}.experience`,
        dbPathComments: `tools.${question.id}.comment`,
        options: TOOLS_OPTIONS.map(id => ({
            id
        })),
        defaultSort: 'options'
    }
}
