"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "../LoadingButton";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import NormToken from "./NormToken";
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
  const { _id, responseId, raw, tokens = [] } = answer;
  const [result, setResult] = useState<NormalizeInBulkResult>();

  const [showResult, setShowResult] = useState(true);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const { enabledPresets } = usePresets({ edition, question });

  const presetsProps = {
    survey,
    edition,
    question,
    questionData,
    responseId,
    normRespId: _id,
    rawValue: raw,
    normPath,
    rawPath,
    tokens,
    entities,
    showPresetsShortlistModal,
  };

  const normTokenProps = {
    survey,
    edition,
    question,
    responseId,
    rawPath,
    normPath,
    rawValue: raw,
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
            {enabledTokens.map((token) => (
              <NormToken
                key={token.id}
                id={token.id}
                isRegular={true}
                isDisabled={false}
                {...normTokenProps}
              />
            ))}

            {disabledTokens.map((token) => (
              <NormToken
                key={token.id}
                id={token.id}
                isRegular={true}
                isDisabled={true}
                {...normTokenProps}
              />
            ))}

            {customTokens.map((token) => (
              <NormToken
                key={token.id}
                id={token.id}
                isCustom={true}
                {...normTokenProps}
              />
            ))}

            {customNormalization?.customTokens?.map((tokenId) => (
              <NormToken
                key={tokenId}
                id={tokenId}
                isCustom={true}
                {...normTokenProps}
              />
            ))}
            {presets
              .filter((id) => !allTokenIds.includes(id))
              .map((id) => (
                <NormToken
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
                  <AllPresets {...presetsProps} />
                </Dialog>
              )}
            </div>
            <LoadingButton
              action={async () => {
                // await addToken(DISCARDED_ANSWER);
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
