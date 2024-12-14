import { EditionMetadata } from "@devographics/types";

export const isAbsoluteUrl = (url?: string) => {
  if (!url) return false;
  return url.indexOf("//") !== -1;
};

export const variants = {
  og: "png",
  sidebar: "svg",
  square: "png",
};

export const getEditionImageUrl = (
  edition: EditionMetadata,
  variant?: "og" | "sidebar" | "square",
) => {
  const variantSuffix = variant ? `-${variant}` : "";
  const extension = variant ? variants[variant] : "png";
  const imageUrl =
    edition.imageUrl ||
    `${import.meta.env.ASSETS_URL}/surveys/${edition.id}${variantSuffix}.${extension}`;
  if (!imageUrl) return;
  let finalImageUrl = isAbsoluteUrl(imageUrl)
    ? imageUrl
    : // legacy behaviour
      `/surveys/${imageUrl}`;

  return finalImageUrl;
};
