"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "./NormalizeQuestionActions";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormField, NormalizationResult } from "./NormalizationResult";
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
import NormToken from "./NormToken";
import { useCopy, highlightMatches, highlightPatterns } from "../hooks";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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
  const [showResponses, setShowResponses] = useState(false);
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
    responses,
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
        {capitalizeFirstLetter(variant)} Responses ({responses.length}){" "}
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
            <tr>
              <th></th>
              <th>Answer</th>
              {variant === "normalized" && <th>Normalized Values</th>}
              <th>Response ID</th>
              <th colSpan={2}>Normalize</th>
            </tr>
          </thead>
          <tbody>
            {responses.map(
              (
                { _id, responseId, value, normalizedValue, patterns },
                index
              ) => (
                <Field
                  key={_id}
                  _id={_id}
                  value={value}
                  normalizedValue={normalizedValue}
                  patterns={patterns}
                  responseId={responseId}
                  index={index}
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
  responses,
  responseId,
  question,
  survey,
  edition,
  questionData,
  rawPath,
  variant,
  index,
}) => {
  const [result, setResult] = useState<NormalizeInBulkResult>();
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const surveyId = survey.id;
  const editionId = edition.id;
  const questionId = question.id;

  return (
    <>
      <tr>
        <td>{index + 1}. </td>
        <td>
          <FieldValue
            value={value}
            normalizedValue={normalizedValue}
            patterns={patterns}
          />
        </td>
        {variant === "normalized" && (
          <td>
            <div className="normalization-tokens">
              {normalizedValue.map((value) => (
                <span>
                  <NormToken id={value} responses={responses} />{" "}
                </span>
              ))}
            </div>
          </td>
        )}
        <td>
          <ResponseId id={responseId} />
        </td>
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

export const FieldValue = ({
  value,
  normalizedValue,
  patterns,
  currentTokenId,
}: {
  value: string | string[];
  normalizedValue?: string[];
  patterns?: string[];
  currentTokenId?: string;
}) => {
  // const sanitizer = new Sanitizer();

  const getValue = (value: string) => {
    return patterns && normalizedValue
      ? highlightPatterns({ value, patterns, normalizedValue, currentTokenId })
      : value;
  };

  if (Array.isArray(value)) {
    return (
      <ul className="field-value-items">
        {value.map((v, i) => (
          <li
            key={i}
            dangerouslySetInnerHTML={{
              __html: getValue(v),
            }}
          />
        ))}
      </ul>
    );
  } else {
    return <span>{value}</span>;
  }
};

export const ResponseId = ({ id }: { id: string }) => {
  const [copied, copy, setCopied] = useCopy(id);

  const truncated = id.slice(0, 6) + "…";
  return (
    <code data-tooltip="Click to copy" onClick={copy}>
      {truncated}
    </code>
  );
};
export default Fields;
