import { isAbsoluteUrl } from "~/core/utils/isAbsoluteUrl";
import { SurveyDescription } from "~/surveys/typings";

/**
 * Get the main survey image,
 * handling legacy scenario of a relative image path
 * 
 * @param survey 
 * @returns A relative or absolute URL of the main survey image
 */
export const getSurveyImageUrl = (survey: SurveyDescription) => {
    const { imageUrl } = survey;
    if (!imageUrl) throw new Error(`Survey with prettySlug ${survey.prettySlug} has no imageUrl`)
    let finalImageUrl = isAbsoluteUrl(imageUrl)
        ? imageUrl
        // legacy behaviour
        : `/surveys/${imageUrl}`;

    return finalImageUrl
}