import { EditionMetadata } from "@devographics/types";

export const getEditionTitle = ({ edition }: { edition: EditionMetadata }) => {
  const { survey, year } = edition;
  const { name } = survey;
  return `${name} ${year}`;
};
