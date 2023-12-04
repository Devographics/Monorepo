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
import AllPresets from "./AllPresets";
import Dialog from "./Dialog";
import {
  DISCARDED_ANSWER,
  CUSTOM_NORMALIZATION,
} from "@devographics/constants";

export interface AnswerProps extends AnswersProps {
  rawPath: string;
  answer: IndividualAnswer;
  index: number;
  letterHeading?: string;
  entities: Entity[];
  responses: NormalizationResponse[];
  showPresetsShortlistModal: () => void;
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
  showPresetsShortlistModal,
}: AnswerProps) => {
  const { _id, responseId, raw, tokens = [] } = answer;
  const [result, setResult] = useState<NormalizeInBulkResult>();
  const [localTokens, setLocalTokens] = useLocalStorage<NormalizationToken[]>(
    getCacheKey(edition, question, responseId),
    []
  );
  const [showResult, setShowResult] = useState(true);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const { enabledPresets } = usePresets({ edition, question });

  const surveyId = survey.id;
  const editionId = edition.id;
  const questionId = question.id;

  const addLocalTokens = (tokens: NormalizationToken[]) => {
    setLocalTokens([...localTokens, ...tokens]);
  };

  const removeLocalTokens = (tokens: NormalizationToken[]) => {
    setLocalTokens(without(localTokens, ...tokens));
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
    addLocalTokens([{ id }] as NormalizationToken[]);
  };

  const removeToken = async (id: string) => {
    const result = await removeManualNormalizations({
      ...addRemoveTokenParams,
      tokens: [id],
    });
    removeLocalTokens([{ id }] as NormalizationToken[]);
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
    addLocalTokens,
    showPresetsShortlistModal,
  };

  const regularTokens = tokens.filter(
    (t) => t.pattern !== CUSTOM_NORMALIZATION
  );
  const customTokens = tokens.filter((t) => t.pattern === CUSTOM_NORMALIZATION);
  const allTokens = [...tokens, ...localTokens];
  const presets = enabledPresets.filter(
    (id) => !allTokens.map((t) => t.id).includes(id)
  );

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
          <div className="tokens-list">
            {regularTokens.map((token) => (
              <NormToken
                key={token.id}
                id={token.id}
                responses={responses}
                entities={entities}
              />
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
                entities={entities}
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
                entities={entities}
              />
            ))}
            {presets.map((id) => (
              <NormToken
                key={id}
                id={id}
                responses={responses}
                isCustom={true}
                action="add"
                addToken={addToken}
                removeToken={removeToken}
                isIncluded={allTokens.some((t) => t.id === id)}
                entities={entities}
              />
            ))}
          </div>
        </td>
        <td>
          <div className="field-row-actions">
            <div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowAllPresets(true);
                }}
                data-tooltip="Add Tokens…"
              >
                ➕
              </button>

              {showAllPresets && (
                <Dialog
                  showModal={showAllPresets}
                  setShowModal={setShowAllPresets}
                  header={<span>All Tokens</span>}
                >
                  <AllPresets {...presetsProps} />
                </Dialog>
              )}
            </div>
            <LoadingButton
              action={async () => {
                await addToken(DISCARDED_ANSWER);
              }}
              label="🗑️"
              tooltip="Discard this answer"
            />
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
