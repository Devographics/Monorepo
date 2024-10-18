import {
    DbPathsEnum,
    EditionMetadata,
    QuestionMetadata,
    ResultsSubFieldEnum,
    SurveyMetadata
} from '@devographics/types'
import takeRight from 'lodash/takeRight.js'

// restrict aggregation to current and past editions, to avoid including results from the future
// when regenerating older surveys
// optionally also only keep n most recent editions
export const getPastNEditions = ({
    survey,
    edition,
    editionCount
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
    editionCount?: number
}) => {
    let pastEditions = survey.editions.filter(
        e => new Date(e.startedAt) <= new Date(edition.startedAt)
    )
    if (editionCount) {
        pastEditions = takeRight(pastEditions, editionCount)
    }
    return pastEditions
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
