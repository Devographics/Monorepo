import { SectionMetadata, QuestionMetadata } from "@devographics/types";
import { useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/i18n/survey";
import type { StringTranslatorResult } from "@devographics/i18n";

export const useQuestionTitle = ({
  section,
  question,
  variant,
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
  variant?: "short" | "full";
}): StringTranslatorResult => {
  const { t, getMessage, getFallbacks, locale } = useI18n();
  const { id, entity } = question;
  const i18n = getQuestioni18nIds({ section, question });

  const getEntityLabel = () => {
    return (entity?.id && {
      key: "entity",
      t: entity.nameClean || entity.name,
      tHtml: entity.nameHtml,
      tClean: entity.nameClean,
    }) as StringTranslatorResult;
  };

  const defaultTitle = {
    key: question.id,
    t: question.id,
    tHtml: question.id,
    tClean: question.id,
  } as StringTranslatorResult;

  const keys =
    variant === "short"
      ? [getEntityLabel, i18n.base, i18n.question]
      : [getEntityLabel, i18n.question, i18n.base];

  const title = getFallbacks(keys);

  return title || defaultTitle;
};
