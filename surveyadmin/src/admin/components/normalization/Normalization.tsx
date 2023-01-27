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
  query UnnormalizedFieldsQuery($surveyId: String, $fieldId: String) {
    unnormalizedFields(surveyId: $surveyId, fieldId: $fieldId)
  }
`;

const usePageParams = () => {
  const router = useRouter();
  const { isReady, isFallback, query } = router;
  if (!isReady || isFallback) return { paramsReady: false, email: null };
  const { surveySlug, fieldId } = query;
  return {
    paramsReady: true,
    surveySlug: surveySlug as string,
    fieldId: fieldId as string,
  };
};

const getNormalizableFields = (survey) => {
  const allQuestions = survey.outline.map((o) => o.questions).flat();
  const fields = allQuestions.filter((q) => q.template === "others");
  // // also add source
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

const NormalizationWrapper = () => {
  const { surveySlug: surveyId, fieldId, paramsReady } = usePageParams();
  if (!surveyId) {
    return (
      <div>
        <h2>No survey slug provided in URL</h2>
        <h3>Available surveys:</h3>
        <ul>
          {surveysWithTemplates.map((survey) => {
            const normalizeUrl = `${routes.admin.normalization.href}/?surveySlug=${survey.slug}`;
            return (
              <li key={survey.slug}>
                <Link href={normalizeUrl}>{survey.slug}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!paramsReady) {
    return <Loading />;
  }

  const survey = surveysWithTemplates.find((s) => s.slug === surveyId);
  if (!survey) {
    return <h3>Survey {surveyId} not found</h3>;
  }

  return <Normalization surveyId={surveyId} fieldId={fieldId} />;
};

const Normalization = ({ surveyId: surveyId_, fieldId: fieldId_ }) => {
  const [responsesCount, setResponsesCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [surveyId, setSurveyId] = useState(surveyId_);
  const [fieldId, setFieldId] = useState(fieldId_);
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
    surveyId,
    setSurveyId,
    fieldId,
    setFieldId,
    normalizationMode,
    setNormalizationMode,
    segments,
    setSegments,
    initializeSegments,
    updateSegments,
    segmentSize,
    setSegmentSize,
  };

  const survey = surveysWithTemplates.find((s) => s.slug === surveyId);

  // get list of all normalizeable ("other") field for current survey
  const normalizeableFields = getNormalizableFields(survey);
  // set field
  const field = normalizeableFields.find((f) => f.id === fieldId);

  const isAllFields = fieldId === allFields.id;
  const onlyUnnormalized = normalizationMode === "only_normalized";

  const {
    loading: unnormalizedFieldsLoading,
    data: unnormalizedFieldsData = {},
    refetch: refetchMissingFields,
  } = useQuery(unnormalizedFieldsQuery, {
    variables: { surveyId, fieldId: isAllFields ? null : fieldId },
  });

  const props = {
    survey,
    field,
    normalizeableFields,
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
      {field && <Fields {...props} />}
    </div>
  );
};

export default NormalizationWrapper;
