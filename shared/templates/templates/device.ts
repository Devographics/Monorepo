import { DbPathsEnum, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const device: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'device',
        rawPaths: {
            response: 'common__user_info__device'
        },
        normPaths: {
            [DbPathsEnum.RESPONSE]: `user_info.device`
        },
        ...question
    }
    return output
}
