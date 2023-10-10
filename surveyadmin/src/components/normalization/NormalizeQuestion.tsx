"use client";

import Actions from "~/components/normalization/NormalizeQuestionActions";
import Progress from "~/components/normalization/Progress";
import Fields from "~/components/normalization/Fields";
import Metadata from "~/components/normalization/Metadata";

import { ResponsesData, useQuestionResponses } from "~/lib/normalization/hooks";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { useSegments } from "./hooks";
import type { QuestionWithSection } from "~/lib/normalization/types";
import QuestionData from "./QuestionData";
import { splitResponses } from "~/lib/normalization/helpers/splitResponses";

export const NormalizeQuestion = (props: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
}) => {
  const { survey, edition, question } = props;
  const { data, loading, error } = useQuestionResponses({
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
  question: QuestionWithSection;
  data: ResponsesData;
}) => {
  const { responsesCount, entities, responses, questionResult, durations } =
    data;

  console.log(durations);

  const questionData = questionResult.data;

  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const { normalizedResponses, unnormalizedResponses } =
    splitResponses(responses);

  const props = {
    responsesCount,
    survey,
    edition,
    question,
    responses,
    normalizedResponses,
    unnormalizedResponses,
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
    questionData,
    entities,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...props} />
      {segments.length > 0 && <Progress {...props} />}
      <Metadata {...props} />
      <QuestionData questionData={questionData} responses={responses} />
      <Fields {...props} variant="normalized" />
      <Fields {...props} variant="unnormalized" />
    </div>
  );
};

export default NormalizeQuestion;
