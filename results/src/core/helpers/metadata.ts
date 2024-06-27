import { EditionMetadata, SectionMetadata } from '@devographics/types'
import { usePageContext } from './pageContext'
import { isToolTemplate, isFeatureTemplate } from '@devographics/helpers'

export const useToolSections = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const toolSections = currentEdition.sections.filter(s =>
        s.questions.some(q => isToolTemplate(q.template))
    )
    return toolSections
}

export const useFeatureSections = () => {
    const context = usePageContext()
    const { currentEdition } = context
    const featureSections = currentEdition.sections.filter(s =>
        s.questions.some(q => isFeatureTemplate(q.template))
    )
    return featureSections
}

export const getQuestionSectionId = (id: string, currentEdition: EditionMetadata) => {
    return currentEdition.sections.find(section => section.questions.find(q => q.id === id))
}
