import { TemplateFunction } from '../../types/surveys'

const specialFieldNames = ['state_of_the_web_happiness', 'state_of_js_happiness']

export const happiness: TemplateFunction = ({ question, section }) => {
    const happinessDbFieldName =
        question.id && specialFieldNames.includes(question.id)
            ? question.id?.replace('_happiness', '')
            : section.id
    return {
        id: 'placeholder',
        ...question,
        dbPath: `happiness.${happinessDbFieldName}`,
        defaultSort: 'options',
        optionsAreNumeric: true,
        options: [...Array(5)].map((x, i) => ({ id: String(i) }))
    }
}
