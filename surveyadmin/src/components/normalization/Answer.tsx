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
import { IndividualAnswerWithIndex } from "~/lib/normalization/helpers/splitResponses";
import { AnswersProps, ResponseId } from "./Answers";
import FieldValue from "./FieldValue";
import {
  NormalizationResponse,
  ResponsesData,
} from "~/lib/normalization/hooks";
import { usePresets } from "./hooks";
import {
  DISCARDED_ANSWER,
  UNSUPPORTED_LANGUAGE,
  CUSTOM_NORMALIZATION,
} from "@devographics/constants";
import { addCustomTokensAction } from "./tokenActions";
import { EntityList } from "./EntityInput";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCustomNormalizationsCacheKey,
  getDataCacheKey,
} from "./NormalizeQuestion";
export interface AnswerProps extends AnswersProps {
  rawPath: string;
  normPath: string;
  answer: IndividualAnswerWithIndex;
  index: number;
  letterHeading?: string;
  entities: Entity[];
  responses: NormalizationResponse[];
  showPresetsShortlistModal: () => void;
  customNormalization?: CustomNormalizationDocument;
  isRepeating: boolean;
  answerIndex: number;
  filterQuery?: string;
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
  answerIndex,
  letterHeading,
  responses,
  showPresetsShortlistModal,
  customNormalization,
  isRepeating = false,
  filterQuery,
  setTokenFilter,
}: AnswerProps) => {
  const queryClient = useQueryClient();

  const { _id, responseId, raw: rawValue, tokens = [] } = answer;
  const [result, setResult] = useState<NormalizeInBulkResult>();

  const [showResult, setShowResult] = useState(true);
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [autocompleteToken, setAutocompleteToken] = useState<string>();
  const [autocompleteIsLoading, setAutocompleteIsLoading] = useState(false);

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
    answerIndex,
    setTokenFilter,
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
  const addTokenParams = {
    ...cacheKeyParams,
    responseId,
    rawValue,
    rawPath,
    normPath,
    answerIndex,
  };
  const addTokenMutation = useCustomNormalizationMutation(
    addCustomTokensAction,
    cacheKeyParams
  );

  const className = `answer-row ${isRepeating ? "answer-row-same" : ""}`;

  return (
    <>
      {letterHeading && (
        <tr className="letter-heading">
          <th colSpan={99}>
            <div className="letter-heading-inner">
              <h3>{letterHeading}</h3>
              <code>{question.id}</code>
            </div>
          </th>
        </tr>
      )}
      <tr className={className}>
        <td>
          <div className="field-row-id">
            <span>{index + 1}.</span>
            <ResponseId id={responseId} />
          </div>
        </td>
        <td>
          <FieldValue
            raw={rawValue}
            tokens={tokens}
            filterQuery={filterQuery}
          />
        </td>

        <td>
          <div className="tokens-list">
            <div aria-busy={autocompleteIsLoading}>
              <EntityList
                entities={entities}
                selectedId={autocompleteToken}
                setSelectedId={async (value) => {
                  setAutocompleteIsLoading(true);
                  setAutocompleteToken(value);
                  if (entities.map((e) => e.id).includes(value)) {
                    await addTokenMutation.mutateAsync({
                      ...addTokenParams,
                      tokens: [value],
                    });
                    setAutocompleteToken("");
                  }
                  setAutocompleteIsLoading(false);
                }}
              />
            </div>
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
            {/* <div>
              <button
                className="button-ghost"
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
            </div> */}

            <LoadingButton
              className="button-ghost"
              action={async () => {
                await addTokenMutation.mutateAsync({
                  ...addTokenParams,
                  tokens: [DISCARDED_ANSWER],
                });
              }}
              label="🗑️"
              tooltip="Discard this answer"
            />
            <LoadingButton
              className="button-ghost"
              action={async () => {
                await addTokenMutation.mutateAsync({
                  ...addTokenParams,
                  tokens: [UNSUPPORTED_LANGUAGE],
                });
              }}
              label="🌍"
              tooltip="Mark as non-English"
            />

            <LoadingButton
              className="button-ghost"
              action={async () => {
                const commonParams = {
                  surveyId: survey.id,
                  editionId: edition.id,
                  questionId: question.id,
                };
                const result = await normalizeQuestionResponses({
                  ...commonParams,
                  responsesIds: [responseId],
                  isVerbose: true,
                });
                setResult(result.data);
                if (result.data) {
                  const { normalizedDocuments } = result.data;
                  const normalizedDocument = normalizedDocuments[0];
                  if (normalizedDocument) {
                    const { normalizedFields, responseId } = normalizedDocument;
                    if (normalizedFields) {
                      const normalizedField = normalizedFields[0];
                      queryClient.setQueryData(
                        [getDataCacheKey(commonParams)],
                        (previous: ResponsesData) => {
                          const { responses } = previous;
                          return {
                            ...previous,
                            responses: responses.map((r) =>
                              responseId === r.responseId
                                ? {
                                    ...r,
                                    metadata: normalizedField.metadata,
                                  }
                                : r
                            ),
                          };
                        }
                      );
                    }
                  } else {
                    console.log("No normalizedDocument returned");
                    console.log(result);
                  }
                }
              }}
              label="🔄"
              tooltip="Renormalize this answer"
            />
          </div>
        </td>
      </tr>
      {/* {result && showResult && (
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
      )} */}
    </>
  );
};
