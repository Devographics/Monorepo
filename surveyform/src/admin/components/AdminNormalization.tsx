import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import get from "lodash/get.js";
import surveys from "~/surveys";
// import { useLocation, useHistory } from "react-router-dom";
import qs from "qs";
import { useRouter } from "next/router.js";
import { useVulcanComponents } from "@vulcanjs/react-ui";

const normalizationQuery = gql`
  query NormalizationQuery($surveySlug: String, $fieldName: String) {
    surveyNormalization(surveySlug: $surveySlug, fieldName: $fieldName)
  }
`;

const getNormalizableFields = (survey) => {
  const allQuestions = survey.outline.map((o) => o.questions).flat();
  const fields = allQuestions.filter((q) => q.template === "others");
  // // also add source
  fields.push({ id: "source", fieldName: "common__user_info__source" });
  return fields;
};

const useAdminNormalizationPageParams = () => {
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

const AdminNormalization = () => {
  const Components = useVulcanComponents();
  const { surveySlug, fieldId, paramsReady } =
    useAdminNormalizationPageParams();

  return (
    <div className="admin-normalization admin-content">
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
          console.log(result);
          alert("Responses normalized");
        }}
      />
      {paramsReady ? (
        <NormalizationData surveySlug={surveySlug} fieldId={fieldId} />
      ) : (
        <Components.Loading />
      )}
    </div>
  );
};

const NormalizationData = ({ surveySlug, fieldId }) => {
  const Components = useVulcanComponents();
  const router = useRouter();

  // set survey
  const defaultSurvey = surveySlug
    ? surveys.find((s) => s.slug === surveySlug)
    : surveys[0];

  const [survey, setSurvey] = useState(defaultSurvey);
  if (!survey) throw new Error(`Survey ${surveySlug} not found`);

  // get list of all normalizeable ("other") field for current survey
  const normalizeableFields = getNormalizableFields(survey);

  // set field
  const defaultField = fieldId
    ? normalizeableFields.find((f) => f.id === fieldId)
    : normalizeableFields[0];
  const [field, setField] = useState(defaultField);

  // run GraphQL query
  const { loading, data = {} } = useQuery(normalizationQuery, {
    variables: { surveySlug: survey?.slug, fieldName: field.fieldName },
  });

  if (loading) {
    return <Components.Loading />;
  }

  const results = get(data, "surveyNormalization");

  if (!results) return <p>Nothing to normalize</p>;

  return (
    <div>
      <h3>
        {results.length} Missing Normalizations for{" "}
        <Components.Dropdown
          label={survey.slug}
          menuItems={surveys.map((survey) => ({
            label: survey.slug,
            onClick: () => {
              setSurvey(survey);

              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug: survey.slug,
                fieldId: field.id,
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
          menuItems={normalizeableFields.map((field) => ({
            label: field.id,
            onClick: () => {
              setField(field);

              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug: survey.slug,
                fieldId: field.id,
              });
              const newUrl = new URL(window.location.href);
              newUrl.search = search;
              router.push(newUrl);
            },
          }))}
        />
      </h3>

      <ol>
        {results.map(({ _id, responseId, value }) => (
          <li key={_id}>
            {value} (<code>{responseId}</code>→<code>{_id}</code>)
          </li>
        ))}
      </ol>

      {/* <Components.Datatable data={[{ a: 1 }, { a: 2 }]} /> */}
    </div>
  );
};
export default AdminNormalization;
