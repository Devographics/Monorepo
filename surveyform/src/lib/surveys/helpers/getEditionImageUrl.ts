import { EditionMetadata } from "@devographics/types";
import { publicConfig } from "~/config/public";
import { isAbsoluteUrl } from "~/lib/utils";

export const variants = {
  og: "png",
  sidebar: "svg",
  square: "png",
};

/**
 * Images live in the "images" repository
 * https://github.com/Devographics/images
 * And deployed on https://assets.devographics.com/
 * For instance an "-og.png" variation for images is expected to exist in this app
 */
export const getEditionImageUrl = (
  edition: EditionMetadata,
  variant?: "og" | "sidebar" | "square"
) => {
  const variantSuffix = variant ? `-${variant}` : "";
  const extension = variant ? variants[variant] : "png";
  const imageUrl =
    edition.imageUrl ||
    `${publicConfig.assetUrl}/surveys/${edition.id}${variantSuffix}.${extension}`;
  if (!imageUrl) return;
  let finalImageUrl = isAbsoluteUrl(imageUrl)
    ? imageUrl
    : // legacy behaviour
      `/surveys/${imageUrl}`;

  return finalImageUrl;
};
