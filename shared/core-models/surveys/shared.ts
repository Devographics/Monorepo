import type { SurveyEdition, SurveyStatus } from "./typings"

/**
 * Functions that gets a safe unique id per survey edition,
 * taking legacy fields into account
 * @param survey 
 * @returns js2022, graphql2022, css2022 etc.
 */
export function getSurveyEditionId(survey: SurveyEdition) {
    // js2022 etc.
    const editionId = survey.editionId || survey.id || survey.surveyId || survey.slug
    return editionId
}
export function getSurveyPrettySlug(survey: SurveyEdition) {
    return survey.surveyId.replaceAll("_", "-")
}

/**
 * @deprecated use SurveyStatusEnum
 */
export const SURVEY_OPEN: SurveyStatus = 2
/**
 * @deprecated use SurveyStatusEnum
 */
export const SURVEY_PREVIEW: SurveyStatus = 1