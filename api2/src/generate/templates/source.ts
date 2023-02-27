import { TemplateFunction } from '../../types/surveys'
import sources from '../../data/sources.yml'

export const source: TemplateFunction = ({ survey, edition, question, section }) => {
    return {
        id: 'source',
        dbPath: 'user_info.source.normalized',
        options: sources[survey.id][edition.id]
    }
}
