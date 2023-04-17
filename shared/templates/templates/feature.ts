import { TemplateFunction } from '@devographics/types'
import { FEATURES_OPTIONS } from '@devographics/constants'

export const feature: TemplateFunction = ({ survey, question }) => {
    return {
        ...question,
        id: question.id || 'placeholder',
        dbSuffix: 'experience',
        dbPath: `features.${question.id}.experience`,
        dbPathComments: `features.${question.id}.comment`,
        options: FEATURES_OPTIONS.map(id => ({
            id
        })),
        defaultSort: 'options'
    }
}
