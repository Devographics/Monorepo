import React, { useState } from "react";
import { useRouter } from "next/router.js";
import { surveysWithTemplates } from "~/surveys/withTemplates";
import Actions from "~/admin/components/normalization/Actions";
import Progress from "~/admin/components/normalization/Progress";
import Fields from "~/admin/components/normalization/Fields";
import { allFields } from "./Actions";
import { useQuery } from "~/lib/graphql";
import gql from "graphql-tag";
import { Loading } from "~/core/components/ui/Loading";
import Link from "next/link";
import { routes } from "~/lib/routes";

export const defaultSegmentSize = 500;

const unnormalizedFieldsQuery = gql`
  query UnnormalizedFieldsQuery($editionId: String, $questionId: String) {
    unnormalizedFields(editionId: $editionId, questionId: $questionId)
  }
`;

const usePageParams = () => {
  const router = useRouter();
  const { isReady, isFallback, query } = router;
  if (!isReady || isFallback) return { paramsReady: false, email: null };
  const { editionId, questionId } = query;
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

export const surveysQuery = gql`
  query SurveysQuery {
    surveys
  }
`;

const NormalizationWrapper = () => {
  const { editionId, questionId, paramsReady } = usePageParams();
  const { loading: surveysLoading, data: surveysData } = useQuery(surveysQuery);

  if (!paramsReady || surveysLoading) {
    return <Loading />;
  }

  const allSurveys = surveysData.surveys;
  const allEditions = allSurveys.map((s) => s.editions).flat();

  if (!editionId) {
    return (
      <div>
        <h2>No editionId provided in URL</h2>
        <h3>Available editions:</h3>
        <ul>
          {allEditions.map((edition) => {
            const normalizeUrl = `${routes.admin.normalization.href}/?editionId=${edition.id}`;
            return (
              <li key={edition.id}>
                <Link href={normalizeUrl}>{edition.id}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const edition = allEditions.find((e) => e.id === editionId);

  if (!edition) {
    return <h3>Edition {editionId} not found</h3>;
  }

  return (
    <Normalization
      allEditions={allEditions}
      edition={edition}
      questionId={questionId}
    />
  );
};

const Normalization = ({ allEditions, edition, questionId: questionId_ }) => {
  const [responsesCount, setResponsesCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [editionId, setEditionId] = useState(edition.id);
  const [questionId, setQuestionId] = useState(questionId_);
  const [normalizationMode, setNormalizationMode] = useState("all");
  const emptySegments: Segment[] = [];
  const [segmentSize, setSegmentSize] = useState(defaultSegmentSize);
  const [segments, setSegments] = useState(emptySegments);

  const initializeSegments = ({ responsesCount, segmentSize }) => {
    const segments = getSegments({ responsesCount, segmentSize });
    setResponsesCount(responsesCount);
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
    setResponsesCount,
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
  const question = normalizeableQuestions.find((f) => f.id === questionId);

  const isAllFields = questionId === allFields.id;
  const onlyUnnormalized = normalizationMode === "only_normalized";

  const {
    loading: unnormalizedFieldsLoading,
    data: unnormalizedFieldsData = {},
    refetch: refetchMissingFields,
  } = useQuery(unnormalizedFieldsQuery, {
    editionId,
    questionId: isAllFields ? null : questionId,
  });

  const props = {
    allEditions,
    edition,
    question,
    normalizeableFields: normalizeableQuestions,
    unnormalizedFieldsLoading,
    unnormalizedFieldsData,
    onlyUnnormalized,
    refetchMissingFields,
    isAllFields,
    ...stateStuff,
  };

  return (
    <div className="admin-normalization admin-content">
      <Actions {...props} />
      {!!responsesCount && <Progress {...props} />}
      {question && <Fields {...props} />}
    </div>
  );
};

export default NormalizationWrapper;
