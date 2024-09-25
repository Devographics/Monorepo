import type { OptionMetadata } from "@devographics/types";
import { QuestionMetadata } from "@devographics/types";
import { useI18n } from "@devographics/react-i18n";
import { getOptioni18nIds } from "~/lib/i18n/survey";

export const useOptionTitle = ({
  question,
  option,
}: {
  question: QuestionMetadata;
  option: OptionMetadata;
}) => {
  const { t } = useI18n();
  const { entity } = option;
  const i18n = getOptioni18nIds({ question, option });

  const entityNameHtml = entity && (entity.nameHtml || entity.name);
  const entityNameClean = entity && (entity.nameClean || entity.name);

  const i18nNameHtml = t(i18n.base);
  const i18nNameClean = t(i18n.base);

  return {
    html: entityNameHtml || i18nNameHtml,
    clean: entityNameClean || i18nNameClean,
  };
};
