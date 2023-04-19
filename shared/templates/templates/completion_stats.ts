import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { getOptions } from './knowledge_score'

export const completion_stats: TemplateFunction = options => {
    const { question } = options
    const output: QuestionTemplateOutput = {
        id: 'completion_stats',
        options: getOptions(),
        normPaths: {
            response: 'user_info.completion'
        },
        ...question
    }
    return output
}
