"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "../LoadingButton";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import {
  NormTokenAction,
  useCustomNormalizationMutation,
} from "./NormTokenAction";
import { Entity, CustomNormalizationDocument } from "@devographics/types";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { AnswersProps, ResponseId } from "./Answers";
import FieldValue from "./FieldValue";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { usePresets } from "./hooks";
import AllPresets from "./AllPresets";
import Dialog from "./Dialog";
import {
  DISCARDED_ANSWER,
  CUSTOM_NORMALIZATION,
} from "@devographics/constants";
import { addCustomTokensAction } from "./tokenActions";
export interface AnswerProps extends AnswersProps {
  rawPath: string;
  normPath: string;
  answer: IndividualAnswer;
  index: number;
  letterHeading?: string;
  entities: Entity[];
  responses: NormalizationResponse[];
  showPresetsShortlistModal: () => void;
  customNormalization: CustomNormalizationDocument;
}

export const Answer = ({
  answer,
  question,
  survey,
  edition,
  questionData,
  rawPath,
  normPath,
  entities,
  index,
  letterHeading,
  responses,
  showPresetsShortlistModal,
  customNormalization,
}: AnswerProps) => {
  const { _id, responseId, raw: rawValue, tokens = [] } = answer;
  const [result, setResult] = useState<NormalizeInBulkResult>();

  const [showResult, setShowResult] = useState(true);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const { enabledPresets } = usePresets({ edition, question });

  const normTokenProps = {
    survey,
    edition,
    question,
    responseId,
    rawPath,
    normPath,
    rawValue,
    responses,
    entities,
  };

  const regularTokens = tokens.filter(
    (t) => t.pattern !== CUSTOM_NORMALIZATION
  );
  const allTokenIds = [
    ...tokens.map((t) => t.id),
    ...(customNormalization?.customTokens || []),
  ];
  const presets = enabledPresets.filter(
    (id) => !tokens.map((t) => t.id).includes(id)
  );

  const customTokens = regularTokens.filter(
    (t) => t.pattern === CUSTOM_NORMALIZATION
  );

  const enabledTokens = regularTokens.filter(
    (t) => !customNormalization?.disabledTokens?.includes(t.id)
  );
  const disabledTokens = regularTokens.filter((t) =>
    customNormalization?.disabledTokens?.includes(t.id)
  );

  const cacheKeyParams = {
    surveyId: survey.id,
    editionId: edition.id,
    questionId: question.id,
  };
  const addDiscardTokenParams = {
    ...cacheKeyParams,
    responseId,
    rawValue,
    rawPath,
    normPath,
    tokens: [DISCARDED_ANSWER],
  };
  const addTokenMutation = useCustomNormalizationMutation(
    addCustomTokensAction,
    cacheKeyParams
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
          <FieldValue raw={rawValue} tokens={tokens} />
        </td>

        <td>
          <div className="tokens-list">
            {enabledTokens.map((token) => (
              <NormTokenAction
                key={token.id}
                id={token.id}
                isRegular={true}
                isDisabled={false}
                {...normTokenProps}
              />
            ))}

            {disabledTokens.map((token) => (
              <NormTokenAction
                key={token.id}
                id={token.id}
                isRegular={true}
                isDisabled={true}
                {...normTokenProps}
              />
            ))}

            {customTokens.map((token) => (
              <NormTokenAction
                key={token.id}
                id={token.id}
                isCustom={true}
                {...normTokenProps}
              />
            ))}

            {customNormalization?.customTokens?.map((tokenId) => (
              <NormTokenAction
                key={tokenId}
                id={tokenId}
                isCustom={true}
                {...normTokenProps}
              />
            ))}
            {presets
              .filter((id) => !allTokenIds.includes(id))
              .map((id) => (
                <NormTokenAction
                  key={id}
                  id={id}
                  isPreset={true}
                  {...normTokenProps}
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
                  <AllPresets
                    {...{
                      survey,
                      edition,
                      question,
                      questionData,
                      responseId,
                      normRespId: _id,
                      rawValue,
                      normPath,
                      rawPath,
                      tokens,
                      entities,
                      setShowAllPresets,
                    }}
                  />
                </Dialog>
              )}
            </div>
            <LoadingButton
              action={async () => {
                await addTokenMutation.mutate(addDiscardTokenParams);
              }}
              label="🗑️"
              tooltip="Discard this answer"
            />
            <LoadingButton
              action={async () => {
                const result = await normalizeQuestionResponses({
                  questionId: question.id,
                  surveyId: survey.id,
                  editionId: edition.id,
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
