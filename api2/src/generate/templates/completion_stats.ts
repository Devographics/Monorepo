import { TemplateFunction } from '../../types/surveys'
import { transformFunction, getOptions } from './knowledge_score'

export const completion_stats: TemplateFunction = ({ question, section }) => ({
    ...question,
    id: 'completion_stats',
    dbPath: 'user_info.completion_stats',
    options: getOptions(),
    transformFunction
})
