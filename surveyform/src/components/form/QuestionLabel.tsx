import { T, useI18n } from "@devographics/react-i18n";
import { getQuestioni18nIds } from "~/lib/i18n/survey";
import { QuestionMetadata, SectionMetadata } from "@devographics/types";
import { useQuestionTitle } from "~/lib/surveys/helpers/useQuestionTitle";

export const QuestionLabel = ({
  section,
  question,
  formatCode = true,
  variant = "full",
}: {
  section: SectionMetadata;
  question: QuestionMetadata;
  formatCode?: boolean;
  variant?: "short" | "full";
}) => {
  const { t, tHtml, tClean, key } = useQuestionTitle({
    section,
    question,
    variant,
  });

  let labelClass =
    key === "entity" ? "question-label entity-label" : "question-label";
  labelClass += formatCode ? " label-html" : " label-plaintext";
  return formatCode ? (
    <span
      data-key={key}
      className={labelClass}
      dangerouslySetInnerHTML={{
        __html: tHtml || tClean || t,
      }}
    />
  ) : (
    <span data-key={key} className={labelClass}>
      {tClean}
    </span>
  );
};

export default QuestionLabel;
