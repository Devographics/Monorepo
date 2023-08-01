import { EditionMetadata, SurveyMetadata } from '@devographics/types'

export const getPastEditions = ({
    survey,
    edition
}: {
    survey: SurveyMetadata
    edition: EditionMetadata
}) => {
    return survey.editions.filter(e => new Date(e.startedAt) <= new Date(edition.startedAt))
}
