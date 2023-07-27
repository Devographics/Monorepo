import { SectionMetadata, QuestionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "@devographics/i18n";

export const useQuestionTitle = ({
  section,
  question,
  variant,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
  variant?: "short" | "full";
}) => {
  const intl = useIntlContext();
  const { id, entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityNameHtml = entity && (entity.nameHtml || entity.name);
  const entityNameClean = entity && (entity.nameClean || entity.name);

  // TODO: formatMessage should return an object with html and clean versions
  // instead of just a string
  const i18nNameHtmlBase = intl.formatMessage({ id: i18n.base });
  const i18nNameCleanBase = intl.formatMessage({ id: i18n.base });

  const i18nNameHtmlQuestion = intl.formatMessage({ id: i18n.question });
  const i18nNameCleanQuestion = intl.formatMessage({ id: i18n.question });

  // by default, try to use the "foo.question" field or else default to just "foo"
  let htmlLabel = i18nNameHtmlQuestion || i18nNameHtmlBase;
  let cleanLabel = i18nNameCleanQuestion || i18nNameCleanBase;

  // if this is the short variant, force using just "foo" (which should hopefully be shorter)
  if (variant === "short") {
    htmlLabel = i18nNameHtmlBase;
    cleanLabel = i18nNameCleanBase;
  }

  return {
    html: entityNameHtml || htmlLabel || id,
    clean: entityNameClean || cleanLabel || id,
    isEntity: !!(entityNameHtml || entityNameClean),
  };
};
