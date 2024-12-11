import { PAST_PARTICIPATIONS } from '@devographics/constants'
import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

const id = 'surveys'

export const previous_surveys: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id,
        rawPaths: {
            response: `${PAST_PARTICIPATIONS}.${id}`
        },
        normPaths: {
            response: `user_info.${PAST_PARTICIPATIONS}.${id}`
        },
        ...question
    }
    return output
}
