/*

Note: happiness paths are hardcoded because they use a special "happiness"
section segment and also the "_happiness" suffix needs to be removed. 

TODO: make paths more standard

*/
import { TemplateFunction, QuestionTemplateOutput } from '@devographics/types'
import { checkHasId } from '../helpers'

const specialFieldNames = [
    'state_of_the_web_happiness',
    'state_of_js_happiness',
    'state_of_css_happiness'
]

export const happiness: TemplateFunction = options => {
    const { edition, section } = options
    const question = checkHasId(options)

    const questionSegment = question.id?.replace('_happiness', '')
    const happinessDbFieldName =
        question.id && specialFieldNames.includes(question.id) ? questionSegment : section.id

    const output: QuestionTemplateOutput = {
        defaultSort: 'options',
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({
            id: String(i),
            intlId: `options.happiness.${String(i)}`
        })),
        rawPaths: {
            response: `happiness__${questionSegment}`
        },
        normPaths: {
            response: `happiness.${happinessDbFieldName}`
        },
        ...question
    }
    return output
}
