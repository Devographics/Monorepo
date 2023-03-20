import type { SurveyEdition } from "./typings"

/**
 * Functions that gets a safe unique id per survey edition,
 * taking legacy fields into account
 * @param survey 
 * @returns js2022, graphql2022, css2022 etc.
 */
export function getSurveyEditionId(survey: SurveyEdition) {
    // js2022 etc.
    const surveyEditionId = survey.surveyEditionId || survey.id || survey.surveyId || survey.slug
    return surveyEditionId
}
export function getSurveyPrettySlug(survey: SurveyEdition) {
    return survey.surveyContextId.replaceAll("_", "-")
}