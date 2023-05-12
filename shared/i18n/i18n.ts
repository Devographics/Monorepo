import type {
    SurveyMetadata,
    EditionMetadata,
    SectionMetadata,
    QuestionMetadata,
    OptionMetadata
} from '@devographics/types'

export const separator = '.'

export const getQuestioni18nIds = ({
    survey,
    edition,
    section,
    question
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
    section: SectionMetadata
    question: QuestionMetadata
}) => {
    const { id: sectionId, slug } = section
    const sectionNamespace = slug || sectionId

    const { id: questionId, i18nNamespace } = question
    const questionNamespace = i18nNamespace || questionId

    const baseSegments = [sectionNamespace, questionNamespace]

    const joinWithBaseSegments = suffix => [...baseSegments, suffix].join(separator)

    const ids = {
        // e.g. user_info.yearly_salary => "Yearly Salary" (legacy)
        base: baseSegments.join(separator),
        // e.g. user_info.yearly_salary.title => "Yearly Salary"
        title: joinWithBaseSegments('title'),
        // e.g. user_info.yearly_salary.description => "How much do you earn?" (legacy)
        description: joinWithBaseSegments('description'),
        // e.g. user_info.yearly_salary.question => "How much do you earn?"
        question: joinWithBaseSegments('question'),
        // e.g. user_info.yearly_salary.note => a note about the question displayed below
        note: joinWithBaseSegments('note')
    }

    return ids
}

export const getOptioni18nIds = ({
    survey,
    edition,
    section,
    question,
    option
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
    section: SectionMetadata
    question: QuestionMetadata
    option: OptionMetadata
}) => {
    const { id: questionId, i18nNamespace } = question
    const questionNamespace = i18nNamespace || questionId

    const baseSegments = ['options', questionNamespace, option.id]

    const ids = {
        // e.g. options.yearly_salary.range_1000_2000
        base: baseSegments.join(separator),
        // e.g. options.yearly_salary.range_1000_2000.description
        description: [...baseSegments, 'description'].join(separator)
    }

    return ids
}
