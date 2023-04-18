import { ApiTemplateFunction } from '../../types/surveys'
import { transformFunction, getOptions } from './knowledge_score'

export const completion_stats: ApiTemplateFunction = options => {
    const { question } = options
    return {
        id: 'completion_stats',
        // dbPath: 'user_info.completion_stats',
        options: getOptions(),
        transformFunction,
        normPaths: {
            response: 'user_info.completion_stats'
        },
        ...question
    }
}
