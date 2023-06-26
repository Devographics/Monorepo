"use client";
import React, { useState } from "react";
import {
  normalizeResponseQuestion,
  normalizeResponses,
} from "~/lib/normalization/services";

const Fields = ({ survey, edition, question, unnormalizedFieldsData }) => {
  const [showIds, setShowIds] = useState(true);

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
              questionId={question.id}
              responseId={responseId}
              surveyId={survey.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Field = ({ _id, value, showIds, responseId, questionId, surveyId }) => {
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
          aria-busy={loading}
          onClick={async () => {
            setLoading(true);
            const result = await normalizeResponseQuestion({
              questionId,
              surveyId,
              responsesIds: [responseId],
            });
            console.log(result);
            setLoading(false);
          }}
        >
          Renormalize
        </button>
      </td>
    </tr>
  );
};
export default Fields;
