import { SectionMetadata, QuestionMetadata, OptionMetadata } from '@devographics/types'

export const separator = '.'

/**
 * When using this function,
 * be careful to define client tokens accordingly
 * @returns
 */
export const getSectioni18nIds = ({ section }: { section: SectionMetadata }) => {
    const { id: sectionId, intlId } = section

    const sectionNamespace = sectionId
    const baseSegments = ['sections', sectionNamespace]
    const base = intlId || baseSegments.join(separator)

    const joinWithBase = (suffix: string) => [base, suffix].join(separator)

    const ids = {
        // e.g. user_info (not used)
        base,
        // e.g. user_info.title => "About You"
        title: joinWithBase('title'),
        // e.g. user_info.prompt => "Let's get to know the real you."
        prompt: joinWithBase('prompt')
    }

    return ids
}

export const getQuestioni18nIds = ({
    section,
    question
}: {
    section: SectionMetadata
    question: QuestionMetadata
}) => {
    const { id: sectionId, slug } = section
    const { id: questionId, sectionId: questionSectionId, i18nNamespace, intlId } = question

    const sectionNamespace = questionSectionId || slug || sectionId
    const questionNamespace = i18nNamespace || questionId

    const baseSegments = [sectionNamespace, questionNamespace]
    const base = intlId || baseSegments.join(separator)

    const joinWithBase = (suffix: string) => [base, suffix].join(separator)

    const ids = {
        // e.g. user_info.yearly_salary => "Yearly Salary" (legacy)
        base,
        // e.g. user_info.yearly_salary.title => "Yearly Salary"
        title: joinWithBase('title'),
        // e.g. user_info.yearly_salary.description => "How much do you earn?" (legacy)
        description: joinWithBase('description'),
        // e.g. user_info.yearly_salary.prompt => "In USD, pre-tax income"
        prompt: joinWithBase('prompt'),
        // e.g. user_info.yearly_salary.question => "How much do you earn?"
        question: joinWithBase('question'),
        // e.g. user_info.yearly_salary.note => a note about the question displayed below
        note: joinWithBase('note'),
        // e.g. resources.video_creators.others => "Other video creators" (legacy)
        others: joinWithBase('others'),
        // e.g. career.workplace_issues.commentPrompt => "Please avoid any personally identifying information"
        commentPrompt: joinWithBase('commentPrompt')
    }

    return ids
}

export const getOptioni18nIds = ({
    question,
    option
}: {
    question: QuestionMetadata
    option: OptionMetadata
}) => {
    const { id, intlId } = option
    const { id: questionId, i18nNamespace } = question
    const questionNamespace = i18nNamespace || questionId

    const baseSegments = ['options', questionNamespace, id]
    const base = intlId || baseSegments.join(separator)

    const ids = {
        // e.g. options.yearly_salary.range_1000_2000
        base,
        // e.g. options.yearly_salary.range_1000_2000.description
        description: [base, 'description'].join(separator)
    }

    return ids
}
