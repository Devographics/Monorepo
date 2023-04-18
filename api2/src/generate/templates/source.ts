import { ApiTemplateFunction } from '../../types/surveys'
import sources from '../../data/sources.yml'
import { DbSuffixes } from '@devographics/types'

export const source: ApiTemplateFunction = ({ survey, edition, question, section }) => {
    return {
        id: 'source',
        // dbPath: 'user_info.source.normalized',
        options: sources[survey.id][edition.id],
        normPaths: {
            response: `user_info.source.${DbSuffixes.NORMALIZED}`
        },
        ...question
    }
}
