"use client";

import Actions from "~/components/normalization/NormalizeQuestionActions";
import Progress from "~/components/normalization/Progress";
import Answers from "~/components/normalization/Answers";
import {
  NormalizationResponse,
  ResponsesData,
  useQuestionResponses,
} from "~/lib/normalization/hooks";
import {
  EditionMetadata,
  SurveyMetadata,
  ResponseData,
  Entity,
} from "@devographics/types";
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
  ) : (
    <Normalization {...props} responsesData={data} />
  );
};

export type CustomNormalizations = {
  [key in string]: string[];
};

export type CustomNormalization = {
  responseId: string;
  tokens: string[];
};

interface NormalizationProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesData?: ResponsesData;
}
export const Normalization = (props: NormalizationProps) => {
  const {
    survey,
    edition,
    question,
    responsesData = {} as ResponsesData,
  } = props;
  const { responsesCount, entities, responses, questionResult, durations } =
    responsesData;

  const questionData = questionResult?.data;

  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const commonProps = {
    survey,
    edition,
    question,
    responsesData,
    responsesCount,
    responses,
    questionData,
    entities,
  };

  const segmentProps = {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...commonProps} {...segmentProps} />
      {segments.length > 0 && <Progress {...commonProps} {...segmentProps} />}
      <QuestionData {...commonProps} />
      {responses ? (
        <AllAnswers {...commonProps} />
      ) : (
        <div>No responses data found.</div>
      )}
    </div>
  );
};

export type SegmentProps = ReturnType<typeof useSegments>;

export interface CommonProps extends NormalizationProps {
  responsesCount: number;
  responses: NormalizationResponse[];
  questionData: ResponseData;
  entities: Entity[];
}

const AllAnswers = (props: CommonProps) => {
  const { allAnswers, normalizedAnswers, unnormalizedAnswers } = splitResponses(
    props.responses
  );
  const fieldsProps = {
    ...props,
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
  };
  return (
    <>
      <Answers {...fieldsProps} variant="normalized" />
      <Answers {...fieldsProps} variant="unnormalized" />
    </>
  );
};
export default NormalizeQuestion;
