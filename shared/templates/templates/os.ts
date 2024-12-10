import { DbPathsEnum, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const os: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'os',
        rawPaths: {
            response: 'common__user_info__os'
        },
        normPaths: {
            [DbPathsEnum.OTHER]: `user_info.os`
        },
        ...question
    }
    return output
}
