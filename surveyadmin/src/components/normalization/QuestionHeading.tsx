import { getQuestioni18nIds } from "@devographics/i18n";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
  QuestionWithSection,
} from "@devographics/types";
import { T } from "@devographics/react-i18n";

const QuestionHeading = ({ question }: { question: QuestionWithSection }) => {
  const i18nIds = getQuestioni18nIds({ section: question.section, question });
  return (
    <div className="question-heading">
      <h5>
        <T token={i18nIds.question} />
      </h5>
    </div>
  );
};

export default QuestionHeading;
