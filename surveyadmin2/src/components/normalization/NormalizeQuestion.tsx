"use client";

import Actions from "~/components/normalization/NormalizeQuestionActions";
import Progress from "~/components/normalization/Progress";
import Fields from "~/components/normalization/Fields";
import {
  UnnormalizedData,
  useUnnormalizedData,
} from "~/lib/normalization/hooks";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import { useSegments } from "./hooks";

export const NormalizeQuestion = (props: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
}) => {
  const { survey, edition, question } = props;
  const { data, loading, error } = useUnnormalizedData({
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  });
  return loading ? (
    <div aria-busy={true} />
  ) : data ? (
    <Normalization {...props} data={data} />
  ) : (
    <div>no data found.</div>
  );
};

export const Normalization = ({
  survey,
  edition,
  question,
  data,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  data: UnnormalizedData;
}) => {
  const { responsesCount, unnormalizedResponses } = data;

  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const props = {
    responsesCount,
    survey,
    edition,
    question,
    unnormalizedResponses,
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...props} />
      {segments.length > 0 && <Progress {...props} />}
      <Fields {...props} />
    </div>
  );
};

export default NormalizeQuestion;
