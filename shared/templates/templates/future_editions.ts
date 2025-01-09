import { FUTURE_PARTICIPATIONS } from '@devographics/constants'
import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

const id = 'editions'

export const future_editions: TemplateFunction = ({ survey, edition, question, section }) => {
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
