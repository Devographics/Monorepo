import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const created_at_date: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'created_at_date',
        rawPaths: {
            response: `createdAtDate`
        },
        normPaths: {
            response: `createdAtDate`
        },
        ...question
    }
    return output
}
