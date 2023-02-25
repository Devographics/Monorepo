import { TemplateFunction, Survey, Option } from '../types'
import sources from '../../data/sources.yml'

const getSourceOptions = (survey: Survey) => {
    const sourceOptions: Option[] = []
    for (const editionId in sources[survey.id]) {
        const edition = sources[survey.id][editionId]
        for (const source of edition) {
            const existingSourceIndex = sourceOptions.findIndex(s => s.id === source.id)
            const existingSource = sourceOptions[existingSourceIndex]
            if (existingSource) {
                sourceOptions[existingSourceIndex] = {
                    id: source.id,
                    editions: [...(existingSource.editions || []), editionId]
                }
            } else {
                sourceOptions.push({ id: source.id, editions: [editionId] })
            }
        }
    }
    return sourceOptions
}

export const source: TemplateFunction = ({ survey, edition, question, section }) => {
    return {
        id: 'source',
        dbPath: 'user_info.source.normalized',
        options: getSourceOptions(survey)
    }
}
