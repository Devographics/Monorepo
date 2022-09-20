/**
 * Parse a survey
 *
 * /!\ Template parsing is done separately, because it involves
 * JSX and should not be reused in scripts
 */
import pickBy from "lodash/pickBy.js";

/*

Filter a response object to only keep fields relevant to the survey

*/
export const getResponseData = (response) => {
  return pickBy(response, (r, k) => k.includes(response.surveySlug));
};
