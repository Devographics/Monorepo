import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
// import gql from "graphql-tag";
import { gql, useMutation } from "@apollo/client";
import get from "lodash/get.js";
// import { useLocation, useHistory } from "react-router-dom";
import qs from "qs";
import { useRouter } from "next/router.js";
import { Components, useVulcanComponents } from "@vulcanjs/react-ui";
import { surveysWithTemplates } from "~/surveys/withTemplates";
// just an alias to avoid changing the whole code
const surveys = surveysWithTemplates;

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

  return (
    <div>
      {survey && <LaunchNormalization survey={survey} />}

      <h3>
        <Components.Dropdown
          label={survey.slug}
          menuItems={surveys.map((survey) => ({
            label: survey.slug,
            onClick: () => {
              setSurvey(survey);

              // build search string to update the browser URL query string
              const search = qs.stringify({
                surveySlug: survey.slug,
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
          label={fieldId}
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

      {field ? (
        <MissingNormalizations survey={survey} field={field} />
      ) : (
        <div>
          Could not find field {surveySlug}/{fieldId}
        </div>
      )}

      {/* <Components.Datatable data={[{ a: 1 }, { a: 2 }]} /> */}
    </div>
  );
};

const MissingNormalizations = ({ survey, field }) => {
  const Components = useVulcanComponents();

  const [showIds, setShowIds] = useState(true);

  // useEffect(()=> {
  // run GraphQL query
  const { loading, data = {} } = useQuery(normalizationQuery, {
    variables: { surveySlug: survey?.slug, fieldName: field?.fieldName },
  });
  // }, [survey, field])

  if (loading) {
    return <Components.Loading />;
  }

  const results = get(data, "surveyNormalization");

  if (!results) return <p>Nothing to normalize</p>;

  return (
    <div>
      <h5>
        {results.length} Missing Normalizations for {survey.slug}/{field.id}
      </h5>
      <p>
        <input
          type="checkbox"
          checked={showIds}
          onClick={() => {
            setShowIds(!showIds);
          }}
        />{" "}
        Show IDs
      </p>
      <ol>
        {results.map(({ _id, responseId, value }) => (
          <li key={_id}>
            {value}{" "}
            {showIds && (
              <span>
                (<code>{responseId}</code>→<code>{_id}</code>)
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};

const segmentSize = 200;
const statuses = { scheduled: 0, inProgress: 1, done: 2 };
const getSegmentStatus = (doneCount, i) => {
  const startFrom = i * segmentSize;
  if (startFrom < doneCount) {
    return statuses.done;
  } else if (startFrom === doneCount) {
    return statuses.inProgress;
  } else {
    return statuses.scheduled;
  }
};

const LaunchNormalization = ({ survey }) => {
  const Components = useVulcanComponents();
  const [responsesCount, setResponsesCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const segments = [...Array(Math.ceil(responsesCount / segmentSize))].map(
    (x, i) => ({
      i,
      startFrom: i * segmentSize,
      status: getSegmentStatus(doneCount, i),
    })
  );
  const segmentInProgress = segments.find(
    (s) => s.status === statuses.inProgress
  );
  const segmentsDone = segments.filter((s) => s.status === statuses.done);
  return (
    <div className="survey-normalization">
      <Components.MutationButton
        label={`Renormalize ${survey.slug}`}
        mutation={gql`
          mutation getSurveyMetadata($surveyId: String) {
            getSurveyMetadata(surveyId: $surveyId)
          }
        `}
        mutationArguments={{ surveyId: survey.slug }}
        successCallback={(result) => {
          setResponsesCount(result?.data?.getSurveyMetadata?.responsesCount);
        }}
      />
      {/* <Components.MutationButton
        label={`Renormalize ${survey.slug}`}
        mutation={gql`
          mutation normalizeSurvey($surveyId: String) {
            normalizeSurvey(surveyId: $surveyId)
          }
        `}
        submitCallback={() => {
          const startFrom = Number(prompt("Start from", "0")) || 0;
          return { mutationArguments: { startFrom } };
        }}
        // mutationOptions={{
        //   name: "normalizeSurvey",
        //   args: { surveyId: "String" },
        // }}
        mutationArguments={{ surveyId: survey.slug }}
        successCallback={(result) => {
          console.log(result);
          // alert("Survey normalized");
        }}
      /> */}
      {responsesCount > 0 && (
        <div>
          <h3>
            Found {responsesCount} responses to normalize…{" "}
            {enabled ? (
              <button
                onClick={() => {
                  setEnabled(false);
                }}
              >
                Stop
              </button>
            ) : (
              <button
                onClick={() => {
                  setEnabled(true);
                }}
              >
                Restart
              </button>
            )}
          </h3>
          {segmentsDone.map((s, i) => (
            <SegmentDone key={i} {...s} responsesCount={responsesCount} />
          ))}
          {
            <SegmentInProgress
              segmentIndex={segmentsDone.length}
              surveyId={survey.slug}
              startFrom={segmentInProgress?.startFrom}
              responsesCount={responsesCount}
              setDoneCount={setDoneCount}
              enabled={enabled}
            />
          }
        </div>
      )}
    </div>
  );
};

const SegmentDone = ({ startFrom, responsesCount }) => (
  <div>
    {startFrom}/{responsesCount} done
  </div>
);

const normalizeSurveyMutation = gql`
  mutation normalizeSurvey($surveyId: String, $startFrom: Int, $limit: Int) {
    normalizeSurvey(surveyId: $surveyId, startFrom: $startFrom, limit: $limit)
  }
`;

const SegmentInProgress = ({
  surveyId,
  segmentIndex,
  startFrom,
  responsesCount,
  setDoneCount,
  enabled,
}) => {
  const Components = useVulcanComponents();

  const [mutateFunction, { data, loading, error }] = useMutation(
    normalizeSurveyMutation,
    {
      onCompleted: (data) => {
        setDoneCount(startFrom + data?.normalizeSurvey?.count);
      },
    }
  );

  useEffect(() => {
    if (enabled) {
      mutateFunction({
        variables: { surveyId, startFrom, limit: segmentSize },
      });
    }
  }, [segmentIndex, enabled]);

  return (
    <div>
      Normalizing {startFrom}/{responsesCount} responses…{" "}
      {enabled ? <Components.Loading /> : <span>Paused</span>}
    </div>
  );
};

export default AdminNormalization;
