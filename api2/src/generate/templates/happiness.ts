/*

Note: happiness paths are hardcoded because they use a special "happiness"
section segment and also the "_happiness" suffix needs to be removed. 

TODO: make paths more standard

*/
import { ApiTemplateFunction } from '../../types/surveys'

const specialFieldNames = [
    'state_of_the_web_happiness',
    'state_of_js_happiness',
    'state_of_css_happiness'
]

export const happiness: ApiTemplateFunction = options => {
    const { edition, question, section } = options
    const questionSegment = question.id?.replace('_happiness', '')
    const happinessDbFieldName =
        question.id && specialFieldNames.includes(question.id) ? questionSegment : section.id

    return {
        id: 'placeholder',
        // dbPath: `happiness.${happinessDbFieldName}`,
        defaultSort: 'options',
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({ id: String(i) })),
        rawPaths: {
            response: `${edition.id}__happiness__${questionSegment}`
        },
        normPaths: {
            response: `happiness.${happinessDbFieldName}`
        },
        ...question
    }
}
