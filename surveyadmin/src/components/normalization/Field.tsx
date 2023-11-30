"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "../LoadingButton";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import NormToken from "./NormToken";
import { Entity } from "@devographics/types";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { ResponseId } from "./Fields";
import FieldValue from "./FieldValue";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import Presets from "./Presets";

export const Field = ({
  _id,
  responseId,
  raw,
  tokens,
  question,
  survey,
  edition,
  questionData,
  rawPath,
  entities,
  index,
  letterHeading,
  responses,
}: IndividualAnswer & {
  letterHeading: string;
  entities: Entity[];
  responses: NormalizationResponse[];
}) => {
  const [result, setResult] = useState<NormalizeInBulkResult>();
  const [showResult, setShowResult] = useState(true);
  const surveyId = survey.id;
  const editionId = edition.id;
  const questionId = question.id;

  const presetsProps = {
    survey,
    edition,
    question,
    questionData,
    responseId,
    normRespId: _id,
    rawValue: raw,
    rawPath,
    tokens,
    entities,
  };

  return (
    <>
      {letterHeading && (
        <tr className="letter-heading">
          <th colSpan={99}>
            <h3>{letterHeading}</h3>
          </th>
        </tr>
      )}
      <tr>
        <td>
          <div className="field-row-id">
            <span>{index + 1}.</span>
            <ResponseId id={responseId} />
          </div>
        </td>
        <td>
          <FieldValue raw={raw} tokens={tokens} />
        </td>
        <td>
          {!tokens ? (
            <Presets {...presetsProps} />
          ) : (
            <div>
              {tokens.map((token) => (
                <NormToken key={token.id} id={token.id} responses={responses} />
              ))}
            </div>
          )}
        </td>

        <td>
          <div className="field-row-actions">
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
              label="🔄"
              tooltip="Renormalize this answer"
            />
          </div>
        </td>
      </tr>
      {result && showResult && (
        <tr>
          <td colSpan={999}>
            <article>
              <NormalizationResult
                setShowResult={setShowResult}
                showQuestionId={false}
                {...result}
              />
            </article>
          </td>
        </tr>
      )}
    </>
  );
};
