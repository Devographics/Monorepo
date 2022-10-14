import React from "react";
import { gql } from "@apollo/client";
import qs from "qs";
import { useRouter } from "next/router.js";
import { useVulcanComponents } from "@vulcanjs/react-ui";
import { surveysWithTemplates } from "~/surveys/withTemplates";

const allFields = { id: "all_fields", label: "All Fields" };

const Actions = ({
  survey,
  field,
  normalizeableFields,
  setResponsesCount,
  setSurveyId,
  setFieldId,
}) => {
  const Components = useVulcanComponents();
  const router = useRouter();

  const fieldId = field.id;
  const surveySlug = survey.slug;

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
              setSurveyId(survey.slug);
              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug,
                fieldId,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
            },
          }))}
        />{" "}
        &gt;{" "}
        <Components.Dropdown
          label={field.id}
          menuItems={fields.map((field) => ({
            label: field.id,
            onClick: () => {
              setFieldId(field.id);
              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug,
                fieldId,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
            },
          }))}
        />{" "}
        &gt;{" "}
        <Components.MutationButton
          label={`Renormalize ${survey.slug}/${fieldId}`}
          mutation={gql`
            mutation getSurveyMetadata($surveyId: String, $fieldId: String) {
              getSurveyMetadata(surveyId: $surveyId, fieldId: $fieldId)
            }
          `}
          mutationArguments={{ surveyId: survey.slug, fieldId }}
          successCallback={(result) => {
            setResponsesCount(result?.data?.getSurveyMetadata?.responsesCount);
          }}
        />
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
