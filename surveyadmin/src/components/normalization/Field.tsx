"use client";
import { useState } from "react";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import { LoadingButton } from "../LoadingButton";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import ManualInput from "./ManualInput";
import NormToken from "./NormToken";
import Dialog from "./Dialog";
import { Entity } from "@devographics/types";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { ResponseId } from "./Fields";
import FieldValue from "./FieldValue";
import { NormalizationResponse } from "~/lib/normalization/hooks";

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
  customNormalizations,
  addCustomNormalization,
  letterHeading,
  responses,
}: IndividualAnswer & {
  letterHeading: string;
  entities: Entity[];
  responses: NormalizationResponse[];
}) => {
  const [result, setResult] = useState<NormalizeInBulkResult>();
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [showEntities, setShowEntities] = useState<boolean>(false);
  const [showResult, setShowResult] = useState(true);
  const surveyId = survey.id;
  const editionId = edition.id;
  const questionId = question.id;

  let customNormalizedValue = customNormalizations[responseId];
  if (customNormalizedValue) {
    // if there a custom tokens, remove any that was already included
    customNormalizedValue = customNormalizedValue.filter(
      (v) => !tokens?.map((t) => t.id)?.includes(v)
    );
  }

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
            <span>*manual norm input*</span>
          ) : (
            <div>
              {tokens.map((token) => (
                <NormToken key={token.id} id={token.id} responses={responses} />
              ))}
            </div>
          )}
        </td>

        {/* <td>
              <button
                onClick={() => {
                  setShowEntities(!showEntities);
                }}
                data-tooltip="Add or edit entities"
              >
                Edit&nbsp;Entities
              </button>
              {showEntities && (
                <Dialog
                  showModal={showEntities}
                  setShowModal={setShowEntities}
                  header={<span>Add/Edit Entities</span>}
                >
                  <EntityInput value={value} entities={entities} />
                </Dialog>
              )}
            </td> */}

        <td>
          <div className="field-row-actions">
            <div>
              <button
                onClick={() => {
                  setShowManualInput(!showManualInput);
                }}
                data-tooltip="Manually enter normalization tokens"
              >
                ✏️
              </button>
              {showManualInput && (
                <Dialog
                  showModal={showManualInput}
                  setShowModal={setShowManualInput}
                  header={<span>Manual Input</span>}
                >
                  <ManualInput
                    survey={survey}
                    edition={edition}
                    question={question}
                    questionData={questionData}
                    responseId={responseId}
                    normRespId={_id}
                    rawValue={raw}
                    rawPath={rawPath}
                    tokens={tokens}
                    entities={entities}
                    addCustomNormalization={addCustomNormalization}
                  />
                </Dialog>
              )}
            </div>
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
