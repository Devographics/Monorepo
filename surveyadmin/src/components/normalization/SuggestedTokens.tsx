"use client";
import { useState } from "react";
import ModalTrigger from "../ui/ModalTrigger";
import { approveTokens, renameTokens } from "~/lib/normalization/services";
import { ActionProps } from "./NormalizeQuestionActions";
import { NormTokenAction } from "./NormTokenAction";
import { CustomNormalizationDocument } from "@devographics/types";
import { Action } from "@sentry/react/types/types";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import FieldValue from "./FieldValue";
import LoadingButton from "../LoadingButton";
import { ResponseId } from "./Answers";

type SuggestedToken = CustomNormalizationDocument & {
  id: string;
  answer: IndividualAnswer;
};

export const getAnswer = (
  allAnswers: IndividualAnswer[],
  customNorm: CustomNormalizationDocument
) =>
  allAnswers.find(
    (a) =>
      a._id === customNorm.responseId &&
      a.answerIndex === customNorm.answerIndex
  );

export const SuggestedTokens = (props: ActionProps) => {
  const { customNormalizations, allAnswers } = props;

  const suggestedTokens: SuggestedToken[] = customNormalizations
    .filter((c) => c.suggestedTokens)
    .map((customNorm) =>
      customNorm.suggestedTokens!.map((id) => ({
        id,
        ...customNorm,
        answer: getAnswer(allAnswers, customNorm),
      }))
    )
    .flat();

  const aiTokens: SuggestedToken[] = customNormalizations
    .filter((c) => c.aiTokens)
    .map((customNorm) =>
      customNorm.aiTokens!.map((id) => ({
        id,
        ...customNorm,
        answer: getAnswer(allAnswers, customNorm),
      }))
    )
    .flat();

  return (
    <ModalTrigger
      isButton={false}
      label={`🗳️ Suggested Tokens ${
        suggestedTokens.length ? `(${suggestedTokens.length})` : ""
      }`}
      tooltip="Suggested tokens pending approval"
      header={<div>Suggested Tokens</div>}
    >
      <>
        <h3>Manual Suggestions</h3>
        <Suggested {...props} suggestedTokens={suggestedTokens} />
        <h3>AI Tokens</h3>
        <AiTokens {...props} aiTokens={aiTokens} />
      </>
    </ModalTrigger>
  );
};

const Suggested = (
  props: ActionProps & {
    suggestedTokens: Array<SuggestedToken>;
  }
) => {
  const { suggestedTokens, setTokenFilter } = props;
  if (suggestedTokens.length === 0) {
    return <p>No token suggestions.</p>;
  }
  return (
    <section>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Answer</th>
            <th>Token</th>
            <th>Rename To</th>
            <th>Dismiss</th>
            <th>Approve</th>
          </tr>
        </thead>
        <tbody>
          {suggestedTokens.map((token) => (
            <Token
              key={token.id}
              token={token}
              setTokenFilter={setTokenFilter}
              type="suggested"
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};

const AiTokens = (
  props: ActionProps & {
    aiTokens: Array<SuggestedToken>;
  }
) => {
  const { aiTokens, setTokenFilter } = props;
  if (aiTokens.length === 0) {
    return <p>No AI tokens.</p>;
  }
  return (
    <section>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Answer</th>
            <th>Token</th>
            {/* <th>Rename To</th>
            <th>Dismiss</th>
            <th>Approve</th> */}
          </tr>
        </thead>
        <tbody>
          {aiTokens.map((token) => (
            <Token
              key={token.id}
              token={token}
              setTokenFilter={setTokenFilter}
              type="ai"
            />
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Token = (props: {
  token: SuggestedToken;
  setTokenFilter: ActionProps["setTokenFilter"];
  type: "suggested" | "ai";
}) => {
  const { token, setTokenFilter, type } = props;
  const { id, answer, _id: customNormId, normalizationId } = token;
  const [renameTo, setRenameTo] = useState(id);

  const tokenPayload = { id, renameTo, customNormId, normalizationId };

  return (
    <tr>
      <td>
        <ResponseId id={customNormId} />
      </td>
      <td>
        <FieldValue raw={answer.raw} />
      </td>
      <td>
        <NormTokenAction
          id={id}
          isSuggested={type === "suggested"}
          isAI={type === "ai"}
          setTokenFilter={setTokenFilter}
          hideAction={true}
        />
      </td>
      {type === "suggested" && (
        <>
          <td>
            <input
              type="text"
              value={renameTo}
              onChange={(e) => {
                setRenameTo(e.target.value);
              }}
            />
          </td>
          <td>
            <LoadingButton
              label="Dismiss"
              tooltip="Dismiss suggestion"
              action={async () => {
                const results = await approveTokens({
                  tokens: [
                    {
                      ...tokenPayload,
                      shouldDismiss: true,
                    },
                  ],
                });
                console.log(results);
              }}
            />
          </td>
          <td>
            <LoadingButton
              label="Approve"
              tooltip="Promote to regular custom token"
              action={async () => {
                const results = await approveTokens({
                  tokens: [tokenPayload],
                });
                console.log(results);
              }}
            />
          </td>
        </>
      )}
    </tr>
  );
};
