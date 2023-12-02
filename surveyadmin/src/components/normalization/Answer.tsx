"use client";
import { useState } from "react";
import {
  addManualNormalizations,
  normalizeQuestionResponses,
  removeManualNormalizations,
} from "~/lib/normalization/services";
import { LoadingButton } from "../LoadingButton";
import {
  NormalizationToken,
  NormalizeInBulkResult,
} from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import NormToken from "./NormToken";
import { Entity } from "@devographics/types";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { AnswersProps, ResponseId } from "./Answers";
import FieldValue from "./FieldValue";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import Presets from "./Presets";
import { useLocalStorage } from "../hooks";
import without from "lodash/without";
import { usePresets } from "./hooks";

export interface AnswerProps extends AnswersProps {
  rawPath: string;
  answer: IndividualAnswer;
  index: number;
  letterHeading?: string;
  entities: Entity[];
  responses: NormalizationResponse[];
  showAllPresetsModal: () => void;
}

const getCacheKey = (edition, question, responseId) =>
  `added_tokens__${edition.id}__${question.id}__${responseId}`;

export const Answer = ({
  answer,
  question,
  survey,
  edition,
  questionData,
  rawPath,
  entities,
  index,
  letterHeading,
  responses,
  showAllPresetsModal,
}: AnswerProps) => {
  const { _id, responseId, raw, tokens = [] } = answer;
  const [result, setResult] = useState<NormalizeInBulkResult>();
  const [localTokens, setLocalTokens] = useLocalStorage<NormalizationToken[]>(
    getCacheKey(edition, question, responseId),
    []
  );
  const [showResult, setShowResult] = useState(true);
  const { enabledPresets } = usePresets({ edition, question });

  const surveyId = survey.id;
  const editionId = edition.id;
  const questionId = question.id;

  const addLocalToken = (id) => {
    setLocalTokens([...localTokens, id]);
  };

  const removeLocalToken = (id) => {
    setLocalTokens(without(localTokens, id));
  };

  const addRemoveTokenParams = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
    tokens,
    responseId,
    normRespId: _id,
    rawValue: raw,
    rawPath,
  };

  const addToken = async (id: string) => {
    const result = await addManualNormalizations({
      ...addRemoveTokenParams,
      tokens: [id],
    });
    addLocalToken({ id } as NormalizationToken);
  };

  const removeToken = async (id: string) => {
    const result = await removeManualNormalizations({
      ...addRemoveTokenParams,
      tokens: [id],
    });
    removeLocalToken({ id } as NormalizationToken);
  };

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
    localTokens,
    addLocalToken,
    showAllPresetsModal,
  };

  const regularTokens = tokens.filter(
    (t) => t.pattern !== "custom_normalization"
  );
  const customTokens = tokens.filter(
    (t) => t.pattern === "custom_normalization"
  );
  const allTokens = [...tokens, ...localTokens];

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
          {/* <Presets {...presetsProps} /> */}
          {enabledPresets.length > 0 ? (
            <div className="tokens-list">
              {enabledPresets.map((id) => (
                <NormToken
                  key={id}
                  id={id}
                  responses={responses}
                  isCustom={true}
                  action="add"
                  addToken={addToken}
                  removeToken={removeToken}
                  isIncluded={allTokens.some((t) => t.id === id)}
                />
              ))}
            </div>
          ) : (
            <a
              onClick={() => {
                showAllPresetsModal();
              }}
              data-tooltip="Add normalization token presets to shortlist"
            >
              Add tokens…
            </a>
          )}
        </td>

        <td>
          <div className="tokens-list">
            {regularTokens.map((token) => (
              <NormToken key={token.id} id={token.id} responses={responses} />
            ))}
            {customTokens.map((token) => (
              <NormToken
                key={token.id}
                id={token.id}
                responses={responses}
                isCustom={true}
                action="remove"
                addToken={addToken}
                removeToken={removeToken}
              />
            ))}
            {localTokens.map((token) => (
              <NormToken
                key={token.id}
                id={token.id}
                responses={responses}
                isCustom={true}
                action="remove"
                addToken={addToken}
                removeToken={removeToken}
              />
            ))}
          </div>
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
