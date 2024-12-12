import { PAST_PARTICIPATIONS } from '@devographics/constants'
import { QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

const id = 'same_survey_count'

export const past_same_survey_count: TemplateFunction = ({
    survey,
    edition,
    question,
    section
}) => {
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
