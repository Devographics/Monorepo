import React from "react";
import { gql } from "@apollo/client";
import qs from "qs";
import { useRouter } from "next/router";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { surveysWithTemplates } from "~/surveys/withTemplates";
import Options from "./Options";

export const allFields = { id: "all_fields", label: "All Fields" };

const Actions = (props) => {
  const {
    surveyId,
    survey,
    fieldId,
    normalizeableFields,
    setSurveyId,
    setFieldId,
    onlyUnnormalized,
    isAllFields,
    initializeSegments,
    segmentSize,
  } = props;
  const Components = useVulcanComponents();
  const router = useRouter();

  const surveySlug = surveyId;

  // get list of all normalizeable ("other") field for current survey
  const fields = [allFields, ...normalizeableFields];

  return (
    <div className="normalization-actions">
      <div className="primary">
        <Components.Dropdown
          label={surveySlug}
          menuItems={surveysWithTemplates.map((survey) => ({
            label: survey.slug,
            onClick: () => {
              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug: survey.slug,
                fieldId,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
              setSurveyId(survey.slug);
            },
          }))}
        />{" "}
        &gt;{" "}
        <Components.Dropdown
          label={fieldId}
          menuItems={fields.map((field) => ({
            label: field.id,
            onClick: () => {
              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug,
                fieldId: field.id,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
              setFieldId(field.id);
            },
          }))}
        />{" "}
        &gt;{" "}
        <Components.MutationButton
          label={`Renormalize ${survey.slug}/${
            isAllFields ? allFields.id : fieldId
          }`}
          mutation={gql`
            mutation getSurveyMetadata(
              $surveyId: String
              $fieldId: String
              $onlyUnnormalized: Boolean
            ) {
              getSurveyMetadata(
                surveyId: $surveyId
                fieldId: $fieldId
                onlyUnnormalized: $onlyUnnormalized
              )
            }
          `}
          mutationArguments={{
            surveyId: survey.slug,
            fieldId: isAllFields ? null : fieldId,
            onlyUnnormalized,
          }}
          successCallback={(result) => {
            const responsesCount =
              result?.data?.getSurveyMetadata?.responsesCount;
            initializeSegments({ responsesCount, segmentSize });
          }}
        />
        <Options {...props} />
      </div>
      <div className="secondary">
        <Components.MutationButton
          label="Renormalize Responses"
          /*
          mutationOptions={{
            name: "normalizeIds",
            args: { ids: "[String]" },
          }}*/
          mutation={gql`
            mutation normalizeIds($ids: [String]) {
              normalizeIds(ids: $ids)
            }
          `}
          // Not needed when returning arguments from the mutation callback
          //mutationArguments={{}}
          submitCallback={() => {
            const idsString = prompt("Enter comma-separated ids") || "";
            const ids = idsString.split(",");
            return { mutationArguments: { ids } };
          }}
          successCallback={(result) => {
            alert("Responses normalized");
          }}
        />
      </div>
    </div>
  );
};

export default Actions;
