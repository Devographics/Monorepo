import { SectionMetadata, QuestionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "@devographics/i18n";

export const useQuestionTitle = ({
  section,
  question,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
}) => {
  const intl = useIntlContext();
  const { entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityNameHtml = entity && (entity.nameHtml || entity.name);
  const entityNameClean = entity && (entity.nameClean || entity.name);

  // TODO: formatMessage should return an object with html and clean versions
  // instead of just a string
  const i18nNameHtml = intl.formatMessage({ id: i18n.base });
  const i18nNameClean = intl.formatMessage({ id: i18n.base });

  const i18nNameHtml2 = intl.formatMessage({ id: i18n.question });
  const i18nNameClean2 = intl.formatMessage({ id: i18n.question });

  return {
    html: entityNameHtml || i18nNameHtml2 || i18nNameHtml,
    clean: entityNameClean || i18nNameClean2 || i18nNameClean,
    isEntity: entityNameHtml || entityNameClean,
  };
};
