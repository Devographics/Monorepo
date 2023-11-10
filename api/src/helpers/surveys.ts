import {
    DbPathsEnum,
    EditionMetadata,
    QuestionMetadata,
    ResultsSubFieldEnum,
    SurveyMetadata
} from '@devographics/types'

export const getPastEditions = ({
    survey,
    edition
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
}) => {
    return survey.editions.filter(e => new Date(e.startedAt) <= new Date(edition.startedAt))
}

/*

We can only filter on one subfield at a time, so try to guess which one
to use based on the subfields available for any given question

*/
export const getMainSubfieldPath = (question: QuestionMetadata) => {
    const normPaths = question.normPaths
    if (!normPaths) {
        throw new Error(`getMainSubfieldPath: question ${question.id} has no normPaths`)
    }
    if (normPaths[DbPathsEnum.RESPONSE]) {
        return normPaths[DbPathsEnum.RESPONSE]
    } else if (normPaths[DbPathsEnum.OTHER]) {
        return normPaths[DbPathsEnum.OTHER]
    }
}
