import { ApiTemplateFunction, QuestionApiTemplateOutput } from '../../types/surveys'
import { groups } from './knowledge_score'

export const completion_stats: ApiTemplateFunction = options => {
    const output: QuestionApiTemplateOutput = {
        id: 'completion_stats',
        normPaths: {
            response: 'user_info.completion'
        },
        groups,
        defaultSort: 'options',
        options: groups,
        optionsAreSequential: true,
        optionsAreRange: true,
        ...options.question
    }
    return output
}
