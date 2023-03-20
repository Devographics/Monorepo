import { QuestionMetadata } from '@devographics/types'
import { usePageContext } from 'core/helpers/pageContext'
import { getAllQuestions } from './options'

export const useEntities = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const allQuestions = getAllQuestions(currentEdition)
    const questionsEntities = allQuestions.map((q: QuestionMetadata) => q.entity).flat()
    const optionsEntities = allQuestions
        .map((q: QuestionMetadata) => q?.options?.map(o => o?.entity))
        .flat()
    const allEntities = [...questionsEntities, ...optionsEntities].filter(e => !!e)
    return allEntities
}

export const useEntity = (id: string) => {
    const allEntities = useEntities()
    return allEntities.find(e => e.id === id)
}
