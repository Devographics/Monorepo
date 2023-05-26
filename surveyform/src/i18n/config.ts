import { EditionMetadata } from "@devographics/types";

// i18n contexts common to all surveys and editions
export const getCommonContexts = () => ["common", "surveys", "accounts"];

// i18n contexts specific to an edition
// (note that all editions of the same survey share the same locale context)
export const getEditionContexts = ({
  edition,
}: {
  edition: EditionMetadata;
}) => [edition.survey.id];
