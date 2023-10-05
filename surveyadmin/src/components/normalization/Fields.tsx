"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "./NormalizeQuestionActions";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import {
  NormField,
  NormalizationResult,
  highlightMatches,
} from "./NormalizationResult";
import {
  EditionMetadata,
  ResponseData,
  SurveyMetadata,
} from "@devographics/types";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";
import { getFormPaths } from "@devographics/templates";
import ManualInput from "./ManualInput";

const Fields = ({
  survey,
  edition,
  question,
  responsesCount,
  responses,
  questionData,
  variant,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  responses: NormalizationResponse[];
  questionData: ResponseData;
  variant: "normalized" | "unnormalized";
}) => {
  const [showResponses, setShowResponses] = useState(true);
  const [showIds, setShowIds] = useState(false);

  if (!responses) return <p>Nothing to normalize</p>;

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const formPaths = getFormPaths({ edition, question: questionObject });

  const fieldProps = {
    showIds,
    question,
    survey,
    edition,
    questionData,
    rawPath: formPaths?.other,
    variant,
  };

  return (
    <div>
      <h3>
        {variant} Responses ({responses.length}){" "}
        <a
          href="#"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            setShowResponses(!showResponses);
          }}
        >
          {showResponses ? "Hide" : "Show"}
        </a>
      </h3>
      {showResponses && (
        <table>
          <thead>
            <th>Answer</th>
            {variant === "normalized" && <th>Normalized Values</th>}
            {showIds && (
              <>
                <th>Raw ID</th>
                <th>Norm. ID</th>
              </>
            )}
            <th colSpan={2}>Normalize</th>
          </thead>
          <tbody>
            {responses.map(
              ({ _id, responseId, value, normalizedValue, patterns }) => (
                <Field
                  key={_id}
                  _id={_id}
                  value={value}
                  normalizedValue={normalizedValue}
                  patterns={patterns}
                  responseId={responseId}
                  {...fieldProps}
                />
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Field = ({
  _id,
  value,
  normalizedValue,
  patterns,
  showIds,
  responseId,
  question,
  survey,
  edition,
  questionData,
  rawPath,
  variant,
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
          <FieldValue value={value} patterns={patterns} />
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
        {variant === "normalized" && (
          <td>
            {normalizedValue.map((value) => (
              <span>
                <code>{value}</code>{" "}
              </span>
            ))}
            {/* <p>
              <code>{patterns}</code>
            </p> */}
            {/* <NormField
              raw={}
              questionId={}
              normTokens={}
              showQuestionId={false}
            /> */}
          </td>
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

const FieldValue = ({ value, patterns }) => {
  // const sanitizer = new Sanitizer();

  const getValue = (value: string) => {
    // const sanitized = sanitizer(value);
    return patterns ? highlightMatches(value, patterns) : value;
  };

  if (Array.isArray(value)) {
    return (
      <ul>
        {value.map((v, i) => (
          <li
            key={i}
            // dangerouslySetInnerHTML={{
            //   __html: getValue(v),
            // }}
          >
            {v}
          </li>
        ))}
      </ul>
    );
  } else {
    return <span>{value}</span>;
  }
};

export default Fields;
