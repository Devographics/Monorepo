import { DbPathsEnum, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const browser: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'browser',
        rawPaths: {
            response: 'common__user_info__browser'
        },
        normPaths: {
            [DbPathsEnum.RESPONSE]: `user_info.browser`
        },
        ...question
    }
    return output
}
