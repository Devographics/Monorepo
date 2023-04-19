import { ApiTemplateFunction } from '../../types/surveys'

export const locale: ApiTemplateFunction = ({ survey, edition, question, section }) => {
    return {
        id: 'locale',
        rawPaths: {
            response: 'locale'
        },
        normPaths: {
            response: `user_info.locale`
        },
        ...question
    }
}
