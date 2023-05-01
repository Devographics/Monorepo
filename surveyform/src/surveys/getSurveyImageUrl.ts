import { isAbsoluteUrl } from "~/core/utils/isAbsoluteUrl";
import { SurveyEditionDescription } from "@devographics/core-models";
import { EditionMetadata } from "@devographics/types";

/**
 * Get the main survey image,
 * handling legacy scenario of a relative image path
 *
 * @param edition
 * @returns A relative or absolute URL of the main survey image
 */
export const getSurveyImageUrl = (edition: EditionMetadata) => {
  const { imageUrl } = edition;
  if (!imageUrl) return;
  let finalImageUrl = isAbsoluteUrl(imageUrl)
    ? imageUrl
    : // legacy behaviour
      `/surveys/${imageUrl}`;

  return finalImageUrl;
};
