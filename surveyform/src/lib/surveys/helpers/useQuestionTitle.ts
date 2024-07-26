import { SectionMetadata, QuestionMetadata } from "@devographics/types";
import { useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/i18n/survey";

export const useQuestionTitle = ({
  section,
  question,
  variant,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
  variant?: "short" | "full";
}) => {
  const { t, getMessage } = useI18n();
  const { id, entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityNameClean = entity && (entity.nameClean || entity.name);
  const entityNameHtml = entity && (entity.nameHtml || entityNameClean);

  const i18nNameHtmlBase = getMessage(i18n.base);
  const i18nNameCleanBase = getMessage(i18n.base);

  const i18nNameHtmlQuestion = getMessage(i18n.question);
  const i18nNameCleanQuestion = getMessage(
    i18n.question,
  );

  // by default, try to use the "foo.question" field or else default to just "foo"
  let htmlLabel = i18nNameHtmlQuestion.tHtml || i18nNameHtmlBase.tHtml;
  let cleanLabel = i18nNameCleanQuestion.tClean || i18nNameCleanBase.tClean;

  // if this is the short variant, force using just "foo" (which should hopefully be shorter)
  if (variant === "short") {
    htmlLabel = i18nNameHtmlBase?.tHtml;
    cleanLabel = i18nNameCleanBase?.tClean;
  }

  const key = i18n.question;
  const title = {
    key,
    html: entityNameHtml || htmlLabel || key,
    clean: entityNameClean || cleanLabel || key,
    isEntity: !!(entityNameHtml || entityNameClean),
  };

  return title;
};
