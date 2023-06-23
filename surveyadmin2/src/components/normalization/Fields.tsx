"use client";
import React, { useState } from "react";
import get from "lodash/get.js";
import { normalizeResponses } from "~/lib/normalization/services";

const Loading = () => <span>⌛</span>;

const Fields = ({
  survey,
  edition,
  question,
  unnormalizedFieldsLoading,
  unnormalizedFieldsData,
}) => {
  const [showIds, setShowIds] = useState(true);

  // useEffect(()=> {
  // run GraphQL query

  // }, [survey, field])

  if (unnormalizedFieldsLoading) {
    return (
      <div>
        Loading… <Loading />
      </div>
    );
  }

  const results = unnormalizedFieldsData;

  if (!results) return <p>Nothing to normalize</p>;

  return (
    <div>
      <h5>
        {results.length} Missing Normalizations for {edition.id}/{question.id}
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
      <table>
        <thead>
          <th>Answer</th>
          {showIds && (
            <>
              <th>Raw ID</th>
              <th>Norm. ID</th>
            </>
          )}
          <th>Normalize</th>
        </thead>
        <tbody>
          {results.map(({ _id, responseId, value }) => (
            <Field
              key={_id}
              _id={_id}
              showIds={showIds}
              value={value}
              responseId={responseId}
              surveyId={survey.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Field = ({ _id, value, showIds, responseId, surveyId }) => {
  const [loading, setLoading] = useState(false);
  return (
    <tr>
      <td>{value}</td>
      {showIds && (
        <>
          <td>
            <code>{responseId}</code>
          </td>
          <td>
            <code>{_id}</code>
          </td>
        </>
      )}
      <td>
        <button
          onClick={async () => {
            const result = await normalizeResponses({
              surveyId,
              responsesIds: [responseId],
            });
            console.log(result);
            setLoading(false);
          }}
        >
          Renormalize {loading ? "⌛" : ""}
        </button>
      </td>
    </tr>
  );
};
export default Fields;
