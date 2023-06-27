"use client";
import React, { useState } from "react";
import {
  normalizeQuestionResponses,
  normalizeResponses,
} from "~/lib/normalization/services";
import { LoadingButton } from "./Actions";

const Fields = ({
  survey,
  edition,
  question,
  responsesCount,
  unnormalizedResponses,
}) => {
  const [showIds, setShowIds] = useState(true);

  if (!unnormalizedResponses) return <p>Nothing to normalize</p>;

  return (
    <div>
      <h5>
        {unnormalizedResponses.length} missing normalizations out of{" "}
        {responsesCount} total responses for {edition.id}/{question.id}.
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
          {unnormalizedResponses.map(({ _id, responseId, value }) => (
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
        <LoadingButton
          action={async () => {
            const result = await normalizeQuestionResponses({
              questionId,
              surveyId,
              responsesIds: [responseId],
            });
            console.log(result);
          }}
          label="Normalize"
        />
      </td>
    </tr>
  );
};
export default Fields;
