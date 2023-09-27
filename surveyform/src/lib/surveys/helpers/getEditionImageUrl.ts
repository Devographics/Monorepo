import { EditionMetadata } from "@devographics/types";
import { publicConfig } from "~/config/public";
import { isAbsoluteUrl } from "~/lib/utils";

export const variants = {
  og: "png",
  sidebar: "svg",
  square: "png",
};

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
