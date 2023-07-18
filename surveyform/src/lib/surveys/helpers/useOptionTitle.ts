import type { OptionMetadata } from "@devographics/types";
import { QuestionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { getOptioni18nIds } from "@devographics/i18n";

export const useOptionTitle = ({
  question,
  option,
}: {
  question: QuestionMetadata;
  option: OptionMetadata;
}) => {
  const intl = useIntlContext();
  const { entity } = option;
  const i18n = getOptioni18nIds({ question, option });

  const entityNameHtml = entity && (entity.nameHtml || entity.name);
  const entityNameClean = entity && (entity.nameClean || entity.name);

  // TODO: formatMessage should return an object with html and clean versions
  // instead of just a string
  const i18nNameHtml = intl.formatMessage({ id: i18n.base });
  const i18nNameClean = intl.formatMessage({ id: i18n.base });

  return {
    html: entityNameHtml || i18nNameHtml,
    clean: entityNameClean || i18nNameClean,
  };
};
