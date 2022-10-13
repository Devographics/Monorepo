import type { SurveyDocument } from "@devographics/core-models";
import { isAbsoluteUrl } from "~/core/utils/isAbsoluteUrl";

/**
 * Get the main survey image,
 * handling legacy scenario of a relative image path
 * 
 * @param survey 
 * @returns A relative or absolute URL of the main survey image
 */
export const getSurveyImageUrl = (survey: SurveyDocument) => {
    const { imageUrl } = survey;
    if (!imageUrl) throw new Error(`Survey with prettySlug ${survey.prettySlug} has no imageUrl`)
    let finalImageUrl = isAbsoluteUrl(imageUrl)
        ? imageUrl
        // legacy behaviour
        : `/surveys/${imageUrl}`;

    return finalImageUrl
}