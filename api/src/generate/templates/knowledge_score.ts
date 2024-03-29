import { ApiTemplateFunction, QuestionApiTemplateOutput } from '../../types/surveys'
import range from 'lodash/range.js'

const groupBy = 10

const getBounds = (n: number) => [n * groupBy, (n + 1) * groupBy]

const getId = (n: number) => `range_${getBounds(n)[0]}_${getBounds(n)[1]}`

/*

Group results into 10% buckets

*/
export const groups = range(0, 100 / groupBy).map(n => {
    const [lowerBound, upperBound] = getBounds(n)
    const average = lowerBound + Math.floor((upperBound - lowerBound) / 2)
    return {
        id: getId(n),
        lowerBound,
        average,
        upperBound
    }
})

export const knowledge_score: ApiTemplateFunction = options => {
    const output: QuestionApiTemplateOutput = {
        id: 'knowledge_score',
        normPaths: {
            response: 'user_info.knowledge_score'
        },
        defaultSort: 'options',
        groups,
        options: groups,
        optionsAreSequential: true,
        optionsAreRange: true,
        ...options.question
    }
    return output
}
