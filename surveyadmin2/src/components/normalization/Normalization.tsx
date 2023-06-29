"use client";

import { useState } from "react";
import Actions from "~/components/normalization/Actions";
import Progress from "~/components/normalization/Progress";
import Fields from "~/components/normalization/Fields";
import { allFields } from "./Actions";
import {
  UnnormalizedData,
  useUnnormalizedData,
} from "~/lib/normalization/hooks";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import { NormalizeInBulkResult } from "~/lib/normalization/types";

export const defaultSegmentSize = 500;

export const statuses = { scheduled: 0, inProgress: 1, done: 2 };

export const getSegmentStatus = ({ doneCount, i, segmentSize }) => {
  const startFrom = i * segmentSize;
  if (startFrom < doneCount) {
    return statuses.done;
  } else if (startFrom === doneCount) {
    return statuses.inProgress;
  } else {
    return statuses.scheduled;
  }
};

export interface Segment {
  i: number;
  startFrom: number;
  status: number;
}

export interface SegmentDone extends Segment {
  data: NormalizeInBulkResult;
}

export const getSegments = ({ responsesCount, segmentSize }): Segment[] => {
  const segments = [...Array(Math.ceil(responsesCount / segmentSize))].map(
    (x, i) => ({
      i,
      startFrom: i * segmentSize,
      status: getSegmentStatus({ doneCount: 0, i, segmentSize }),
    })
  );
  return segments;
};

export const NormalizationDashboard = (props: {
  surveys: SurveyMetadata[];
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
  surveys,
  survey,
  edition,
  question,
  data,
}: {
  surveys: SurveyMetadata[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  data: UnnormalizedData;
}) => {
  const { responsesCount, unnormalizedResponses } = data;
  const allEditions = surveys.map((s) => s.editions).flat();

  // const [responsesCount, setResponsesCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [editionId, setEditionId] = useState(edition.id);
  const [questionId, setQuestionId] = useState(question.id);
  const [normalizationMode, setNormalizationMode] = useState("all");
  const emptySegments: Segment[] = [];
  const [segmentSize, setSegmentSize] = useState(defaultSegmentSize);
  const [segments, setSegments] = useState(emptySegments);

  const initializeSegments = (options = { responsesCount, segmentSize }) => {
    const { responsesCount, segmentSize } = options;
    const segments = getSegments({ responsesCount, segmentSize });
    // setResponsesCount(responsesCount);
    setSegments(segments);
  };

  const updateSegments = ({
    doneCount,
    doneSegmentIndex,
    doneSegmentData,
    segmentSize,
  }: {
    doneCount: number;
    doneSegmentIndex: number;
    doneSegmentData: NormalizeInBulkResult;
    segmentSize: number;
  }) => {
    setDoneCount(doneCount);
    setSegments((oldSegments) => {
      const newSegments = oldSegments.map((s, i) => ({
        ...s,
        status: getSegmentStatus({ doneCount, i, segmentSize }),
        ...(doneSegmentIndex === i ? { data: doneSegmentData } : {}),
      }));
      return newSegments;
    });
  };

  const stateStuff = {
    responsesCount,
    // setResponsesCount,
    doneCount,
    setDoneCount,
    enabled,
    setEnabled,
    editionId,
    setEditionId,
    questionId,
    setQuestionId,
    normalizationMode,
    setNormalizationMode,
    segments,
    setSegments,
    initializeSegments,
    updateSegments,
    segmentSize,
    setSegmentSize,
  };

  const isAllFields = questionId === allFields.id;
  const onlyUnnormalized = normalizationMode === "only_normalized";

  const props = {
    allEditions,
    survey,
    edition,
    question,
    // unnormalizedFieldsLoading: loading,
    unnormalizedResponses,
    onlyUnnormalized,
    refetchMissingFields: () => {},
    isAllFields,
    ...stateStuff,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...props} />
      {segments.length > 0 && <Progress {...props} />}
      <Fields {...props} />
    </div>
  );
};

export default NormalizationDashboard;
