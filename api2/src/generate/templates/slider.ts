import { Question } from '@devographics/types'
import { TemplateFunction } from '../../types/surveys'

const getSliderOptions = (question: Question) => {
    const lowerBound = question.from ?? 0
    const upperBound = question.to ?? 9
    const delta = upperBound - lowerBound + 1
    const options = [...Array(delta)].map((x, i) => ({ id: String(lowerBound + i) }))
    return options
}

export const slider: TemplateFunction = ({ question, section }) => ({
    id: 'placeholder',
    ...question,
    defaultSort: 'options',
    dbPath: `${section.id}.${question.id}.choices`,
    optionsAreNumeric: true,
    options: getSliderOptions(question)
})
