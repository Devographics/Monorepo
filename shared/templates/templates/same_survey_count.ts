import { PREVIOUS_PARTICIPATIONS } from '@devographics/constants'
import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

const id = 'same_survey_count'

export const same_survey_count: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id,
        rawPaths: {
            response: `${PREVIOUS_PARTICIPATIONS}.${id}`
        },
        normPaths: {
            response: `user_info.${PREVIOUS_PARTICIPATIONS}.${id}`
        },
        ...question
    }
    return output
}
