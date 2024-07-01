import { SectionMetadata, QuestionMetadata } from "@devographics/types";
import { useIntlContext } from "@devographics/react-i18n-legacy";
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
  const intl = useIntlContext();
  const { id, entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const entityNameClean = entity && (entity.nameClean || entity.name);
  const entityNameHtml = entity && (entity.nameHtml || entityNameClean);

  const i18nNameHtmlBase = intl.formatMessage({ id: i18n.base });
  const i18nNameCleanBase = intl.formatMessage({ id: i18n.base });

  const i18nNameHtmlQuestion = intl.formatMessage({ id: i18n.question });
  const i18nNameCleanQuestion = intl.formatMessage({
    id: i18n.question,
  });

  console.log("//////");
  console.log(i18n);
  console.log(i18nNameHtmlBase);
  console.log(i18nNameCleanBase);
  console.log(i18nNameHtmlQuestion);
  console.log(i18nNameCleanQuestion);

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
