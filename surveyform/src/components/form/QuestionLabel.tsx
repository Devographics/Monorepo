import { FormattedMessage } from "~/components/common/FormattedMessage";
import { getQuestioni18nIds } from "~/i18n/survey";
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
  const { html, clean, isEntity } = useQuestionTitle({
    section,
    question,
    variant,
  });
  const labelClass = isEntity ? "entity-label" : "question-label";
  return formatCode ? (
    <span
      className={labelClass}
      dangerouslySetInnerHTML={{
        __html: html || clean,
      }}
    />
  ) : (
    <span className={labelClass}>{clean}</span>
  );
};

export default QuestionLabel;
