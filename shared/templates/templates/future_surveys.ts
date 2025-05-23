import { FUTURE_PARTICIPATIONS } from '@devographics/constants'
import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

const id = 'surveys'

export const future_surveys: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id,
        rawPaths: {
            response: `${FUTURE_PARTICIPATIONS}.${id}`
        },
        normPaths: {
            response: `user_info.${FUTURE_PARTICIPATIONS}.${id}`
        },
        ...question
    }
    return output
}
