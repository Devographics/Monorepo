import { number } from './number'
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { addQuestionId } from '../helpers'

/*

Note: upper bounds are non-inclusive, so upper bound for group "range_20_24" is
"everything under 25, but not 25" e.g. 24, 24.5, 24.9999, etc. 

*/
const groups = [
    {
        id: 'range_under_20',
        lowerBound: 0,
        average: 17.5,
        upperBound: 20
    },
    {
        id: 'range_20_29',
        lowerBound: 20,
        upperBound: 30
    },
    {
        id: 'range_30_39',
        lowerBound: 30,
        upperBound: 40
    },
    {
        id: 'range_40_49',
        lowerBound: 40,
        upperBound: 50
    },
    {
        id: 'range_50_59',
        lowerBound: 50,
        upperBound: 60
    },
    {
        id: 'range_over_60',
        lowerBound: 60,
        average: 65
    }
]

export const age_number: TemplateFunction = options => {
    const id = 'age'
    const output: QuestionTemplateOutput = { ...number(addQuestionId(options, id)), groups }
    return output
}
