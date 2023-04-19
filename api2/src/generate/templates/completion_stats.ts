import { ApiTemplateFunction } from '../../types/surveys'
import { transformFunction } from './knowledge_score'
import { completion_stats as templateFunction } from '@devographics/templates'

export const completion_stats: ApiTemplateFunction = options => ({
    ...templateFunction(options),
    transformFunction
})
