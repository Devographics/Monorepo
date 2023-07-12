import { EditionMetadata } from "@devographics/types";
import { isAbsoluteUrl } from "~/lib/utils";
import { getEnvVar, EnvVar } from "@devographics/helpers";

export const variants = {
  og: "png",
  sidebar: "svg",
  square: "png",
};

export const getSurveyImageUrl = (
  edition: EditionMetadata,
  variant?: "og" | "sidebar" | "square"
) => {
  const variantSuffix = variant ? `-${variant}` : "";
  const extension = variant ? variants[variant] : "png";
  const imageUrl = `https://${getEnvVar(EnvVar.ASSETS_URL)}/surveys/${
    edition.id
  }${variantSuffix}.${extension}`;
  if (!imageUrl) return;
  let finalImageUrl = isAbsoluteUrl(imageUrl)
    ? imageUrl
    : // legacy behaviour
      `/surveys/${imageUrl}`;

  return finalImageUrl;
};
