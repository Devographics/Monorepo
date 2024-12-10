import { DbPathsEnum, QuestionTemplateOutput, TemplateFunction } from '@devographics/types'

export const version: TemplateFunction = ({ survey, edition, question, section }) => {
    const output: QuestionTemplateOutput = {
        id: 'version',
        rawPaths: {
            response: 'common__user_info__version'
        },
        normPaths: {
            [DbPathsEnum.OTHER]: `user_info.version`
        },
        ...question
    }
    return output
}
