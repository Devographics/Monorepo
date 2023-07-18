"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "./NormalizeQuestionActions";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import { UnnormalizedResponses } from "~/lib/normalization/hooks";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";
import { getFormPaths } from "@devographics/templates";
import {
  getResponsesSelector,
  getUnnormalizedResponsesSelector,
} from "~/lib/normalization/helpers/getSelectors";

const Fields = ({
  survey,
  edition,
  question,
  responsesCount,
  unnormalizedResponses,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  unnormalizedResponses: UnnormalizedResponses[];
}) => {
  const [showIds, setShowIds] = useState(true);

  if (!unnormalizedResponses) return <p>Nothing to normalize</p>;

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const formPaths = getFormPaths({ edition, question: questionObject });

  const rawSelector = getResponsesSelector({
    edition,
    questionObject,
  });
  const normSelector = getUnnormalizedResponsesSelector({
    edition,
    questionObject,
  });

  return (
    <div>
      <p>
        <strong>{unnormalizedResponses.length}</strong> missing normalizations
        out of <strong>{responsesCount}</strong> total responses for{" "}
        <code>
          {edition.id}/{question.id}
        </code>
        .
      </p>
      <p>
        <ul>
          <li>
            Raw Path: <code>{formPaths?.other}</code>
          </li>
          <li>
            Selector: <textarea>{JSON.stringify(rawSelector)}</textarea>
          </li>
          <li>
            Normalized Path: <code>{questionObject?.normPaths?.other}</code>
          </li>
          <li>
            Selector: <textarea>{JSON.stringify(normSelector)}</textarea>
          </li>
        </ul>
      </p>
      <p>
        Match Tags:{" "}
        <span>
          <code>{question.id} [id]</code>{" "}
        </span>
        {question.matchTags?.map((tag) => (
          <span key={tag}>
            <code>{tag}</code>{" "}
          </span>
        ))}
      </p>
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
              editionId={edition.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Field = ({
  _id,
  value,
  showIds,
  responseId,
  questionId,
  surveyId,
  editionId,
}) => {
  const [result, setResult] = useState<NormalizeInBulkResult>();
  return (
    <>
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
                editionId,
                responsesIds: [responseId],
              });
              setResult(result.data);
              console.log(result);
            }}
            label="Normalize"
          />
        </td>
      </tr>
      {result && (
        <tr>
          <td colSpan={999}>
            <article>
              <NormalizationResult showQuestionId={false} {...result} />
            </article>
          </td>
        </tr>
      )}
    </>
  );
};
export default Fields;
