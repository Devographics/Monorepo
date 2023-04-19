import { DbSuffixes, Question } from '@devographics/types'
import { ApiTemplateFunction } from '../../types/surveys'
import { getPaths } from '../helpers'

const getSliderOptions = (question: Question) => {
    const lowerBound = question.from ?? 0
    const upperBound = question.to ?? 9
    const delta = upperBound - lowerBound + 1
    const options = [...Array(delta)].map((x, i) => ({ id: String(lowerBound + i) }))
    return options
}

export const slider: ApiTemplateFunction = options => {
    const { question } = options
    return {
        id: 'placeholder',
        defaultSort: 'options',
        // dbSuffix: 'choices',
        // dbPath: `${section.id}.${question.id}.choices`,
        optionsAreNumeric: true,
        options: getSliderOptions(question),
        ...getPaths(options, DbSuffixes.CHOICES),
        ...question
    }
}
