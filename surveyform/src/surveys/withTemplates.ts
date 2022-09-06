import surveys from "~/surveys";
import { addTemplatesToSurvey } from "~/modules/responses/addTemplateToSurvey";

/**
 * Surveys that can be rendered in React based on their template
 *
 * For non-react code, prefer loading "surveys"
 */
export const surveysWithTemplates = surveys.map(addTemplatesToSurvey);
