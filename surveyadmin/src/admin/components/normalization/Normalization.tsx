import React, { useState } from "react";
import { useRouter } from "next/router.js";
import { surveysWithTemplates } from "~/surveys/withTemplates";
import { useQuery, gql } from "@apollo/client";
import Actions from "~/admin/components/normalization/Actions";
import Progress from "~/admin/components/normalization/Progress";
import Fields from "~/admin/components/normalization/Fields";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { allFields } from "./Actions";

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

const NormalizationWrapper = () => {
  const Components = useVulcanComponents();
  const { surveySlug: surveyId, fieldId, paramsReady } = usePageParams();

  if (!paramsReady) {
    return <Components.Loading />;
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
  const [normalizationMode, setNormalizationMode] = useState("only_normalized");

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
