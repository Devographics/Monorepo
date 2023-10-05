"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "./NormalizeQuestionActions";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import {
  EditionMetadata,
  QuestionMetadata,
  ResponseData,
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
import ManualInput from "./ManualInput";

const Fields = ({
  survey,
  edition,
  question,
  responsesCount,
  unnormalizedResponses,
  questionData,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  unnormalizedResponses: UnnormalizedResponses[];
  questionData: ResponseData;
}) => {
  const [showIds, setShowIds] = useState(true);
  const [showDbInfo, setShowDbInfo] = useState(false);

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

  const fieldProps = {
    showIds,
    question,
    survey,
    edition,
    questionData,
    rawPath: formPaths?.other,
  };

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
        <a
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowDbInfo(!showDbInfo);
          }}
        >
          {showDbInfo ? "Hide" : "Show"} DB Info
        </a>
        {showDbInfo && (
          <article>
            <p>
              <ul>
                <li>
                  Raw Path: <code>{formPaths?.other}</code>
                </li>
                <li>
                  Selector: <textarea>{JSON.stringify(rawSelector)}</textarea>
                </li>
                <li>
                  Normalized Path:{" "}
                  <code>{questionObject?.normPaths?.other}</code>
                </li>
                <li>
                  Selector: <textarea>{JSON.stringify(normSelector)}</textarea>
                </li>
              </ul>
            </p>
          </article>
        )}
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
          <th colSpan={2}>Normalize</th>
        </thead>
        <tbody>
          {unnormalizedResponses.map(({ _id, responseId, value }) => (
            <Field
              key={_id}
              _id={_id}
              value={value}
              responseId={responseId}
              {...fieldProps}
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
  question,
  survey,
  edition,
  questionData,
  rawPath,
}) => {
  const [result, setResult] = useState<NormalizeInBulkResult>();
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const surveyId = survey.id;
  const editionId = edition.id;
  const questionId = question.id;

  return (
    <>
      <tr>
        <td>
          <FieldValue value={value} />
        </td>
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
            onClick={() => {
              setShowManualInput(!showManualInput);
            }}
          >
            Input&nbsp;ID(s)
          </button>
        </td>
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
            label="Autonormalize"
          />
        </td>
      </tr>
      {showManualInput && (
        <tr>
          <td colSpan={999}>
            <article>
              <ManualInput
                survey={survey}
                edition={edition}
                question={question}
                questionData={questionData}
                responseId={responseId}
                normRespId={_id}
                rawValue={value}
                rawPath={rawPath}
              />
            </article>
          </td>
        </tr>
      )}
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

const FieldValue = ({ value }) => {
  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    );
  } else {
    return <span>{value}</span>;
  }
};

export default Fields;
