import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const locale: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'locale',
        rawPaths: {
            response: 'locale'
        },
        normPaths: {
            response: `user_info.locale`
        },
        ...question
    }
    return output
}
