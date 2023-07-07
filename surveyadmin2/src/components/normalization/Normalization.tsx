"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Actions from "~/components/normalization/Actions";
import Progress from "~/components/normalization/Progress";
import Fields from "~/components/normalization/Fields";
import { allFields } from "./Actions";
import Link from "next/link";
import { routes } from "~/lib/routes";
import { loadFields } from "~/lib/normalization/services";
import { useUnnormalizedFields } from "~/lib/normalization/hooks";

export const defaultSegmentSize = 500;

// const unnormalizedFieldsQuery = gql`
//   query UnnormalizedFieldsQuery($editionId: String, $questionId: String) {
//     unnormalizedFields(editionId: $editionId, questionId: $questionId)
//   }
// `;

const usePageParams = () => {
  const searchParams = useSearchParams();
  const editionId = searchParams.get("editionId");
  const questionId = searchParams.get("questionId");
  return {
    paramsReady: true,
    editionId: editionId as string,
    questionId: questionId as string,
  };
};

const getNormalizableQuestions = (edition) => {
  const allQuestions = edition.sections.map((o) => o.questions).flat();
  const fields = allQuestions.filter((q) => q.template === "others");
  // also add source
  fields.push({ id: "source", fieldName: "common__user_info__source" });
  return fields;
};

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

interface Segment {
  i: number;
  startFrom: number;
  status: number;
  data?: any;
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

export const Normalization = ({
  surveys,
  survey,
  edition,
  question,
  responsesCount,
}) => {
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

  const initializeSegments = ({ responsesCount, segmentSize }) => {
    const segments = getSegments({ responsesCount, segmentSize });
    // setResponsesCount(responsesCount);
    setSegments(segments);
  };

  const updateSegments = ({
    doneCount,
    doneSegmentIndex,
    doneSegmentData,
    segmentSize,
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

  // get list of all normalizeable ("other") field for current survey
  const normalizeableQuestions = getNormalizableQuestions(edition);
  // set field

  const isAllFields = questionId === allFields.id;
  const onlyUnnormalized = normalizationMode === "only_normalized";

  const { data, loading, error } = useUnnormalizedFields({
    surveyId: edition.survey.id,
    editionId,
    questionId: isAllFields ? null : questionId,
  });

  const props = {
    allEditions,
    survey,
    edition,
    question,
    normalizeableFields: normalizeableQuestions,
    // unnormalizedFieldsLoading: loading,
    unnormalizedFieldsData: data,
    onlyUnnormalized,
    refetchMissingFields: () => {},
    isAllFields,
    ...stateStuff,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...props} />
      {/* {!!responsesCount && <Progress {...props} />} */}
      <h3>{responsesCount} total responses</h3>
      {<Fields {...props} />}
    </div>
  );
};

export default Normalization;
