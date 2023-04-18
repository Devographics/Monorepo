import { ApiTemplateFunction } from '../../types/surveys'
import { getPaths } from '../helpers'

export const defaultTemplateFunction: ApiTemplateFunction = options => {
    const { question } = options
    return {
        id: 'placeholder',
        ...getPaths(options),
        ...question
        // dbPath: `${section.id}.${question.id}`
    }
}
