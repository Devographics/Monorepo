import { DbSuffixes, Question, QuestionTemplateOutput } from '@devographics/types'
import { TemplateFunction } from '@devographics/types'
import { getPaths, checkHasId } from '../helpers'

const getSliderOptions = (question: Question) => {
    const lowerBound = question.from ?? 0
    const upperBound = question.to ?? 9
    const delta = upperBound - lowerBound + 1
    const options = [...Array(delta)].map((x, i) => ({ id: lowerBound + i }))
    return options
}

export const slider: TemplateFunction = options => {
    const question = checkHasId(options)

    const output: QuestionTemplateOutput = {
        defaultSort: 'options',
        optionsAreNumeric: true,
        options: getSliderOptions(question),
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }

    return output
}
