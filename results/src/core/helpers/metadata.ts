import { EditionMetadata, SectionMetadata } from '@devographics/types'
import { usePageContext } from './pageContext'

export const useToolSections = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const toolSections = currentEdition.sections.filter(s =>
        s.questions.some(q => q.template === 'tool')
    )
    return toolSections
}

export const useFeatureSections = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const featureSections = currentEdition.sections.filter(s =>
        s.questions.some(q => q.template === 'feature')
    )
    return featureSections
}

export const getQuestionSectionId = (id: string, currentEdition: EditionMetadata) => {
    return currentEdition.sections.find(section => section.questions.find(q => q.id === id))
}
