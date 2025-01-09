import { DbPathsEnum, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const authmode: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'authmode',
        rawPaths: {
            response: 'common__user_info__authmode'
        },
        normPaths: {
            [DbPathsEnum.RESPONSE]: `user_info.authmode`
        },
        ...question
    }
    return output
}
