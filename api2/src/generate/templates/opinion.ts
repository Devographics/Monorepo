import { ApiTemplateFunction } from '../../types/surveys'
import { getPaths } from '../helpers'

export const opinion: ApiTemplateFunction = options => {
    const { question, section } = options
    return {
        id: 'placeholder',
        // dbPath: `${section.id}.${question.id}`,
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({ id: String(i) })),
        ...getPaths(options),
        ...question
    }
}
