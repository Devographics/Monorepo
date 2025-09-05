"use client";
import { EditionMetadata } from "@devographics/types";
import ModalTrigger from "../ui/ModalTrigger";
import { ActionProps } from "./NormalizeQuestionActions";
import { NormTokenAction } from "./NormTokenAction";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { getAnswer } from "./SuggestedTokens";
import uniq from "lodash/uniq";
import take from "lodash/take";
import compact from "lodash/compact";
import sortBy from "lodash/sortBy";
import { ResponseId } from "./Answers";
import { useState } from "react";
import { CommonNormalizationProps } from "./NormalizeQuestion";
import LoadingButton from "../LoadingButton";
import {
  deleteTokens,
  removeCustomTokens,
  renameTokens,
} from "~/lib/normalization/services";
import { Token } from "./Tokens";

const showAnswersCount = 3;

type AiToken = {
  tokenId: string;
  answer: IndividualAnswer;
};

type AiTokenGrouped = {
  tokenId: string;
  answers: IndividualAnswer[];
};

export const AiTokensTrigger = (props: ActionProps) => {
  const { customNormalizations, allAnswers, questionTokens } = props;

  // const aiTokens: AiToken[] = customNormalizations
  //   .map((customNorm) => customNorm.aiTokens || [])
  //   .flat()
  //   .map((tokenId) => ({ tokenId, answers: getAnswers(tokenId) }));

  // get list of all ai normalizations
  const aiNormalizations: AiToken[] = customNormalizations
    .filter((c) => c.aiTokens)
    .map((customNorm) =>
      customNorm.aiTokens!.map((tokenId) => ({
        tokenId,
        answer: getAnswer(allAnswers, customNorm)!,
      }))
    )
    .flat();

  // group normalizations by token
  const aiTokens: AiTokenGrouped[] = sortBy(
    uniq(aiNormalizations.map((t) => t.tokenId)).map((tokenId) => ({
      tokenId,
      answers: compact(
        aiNormalizations
          .filter((t) => t.tokenId === tokenId)
          .map((t) => t.answer)
          .flat()
      ),
    })),
    (t) => t.answers.length
  ).toReversed();

  return (
    <ModalTrigger
      isButton={false}
      label={`🤖 AI Tokens ${aiTokens.length ? `(${aiTokens.length})` : ""}`}
      tooltip="Suggested tokens pending approval"
      header={<div>{aiTokens.length} AI Tokens</div>}
    >
      <AiTokens {...props} aiTokens={aiTokens} />
    </ModalTrigger>
  );
};

export const AiTokens = (
  props: ActionProps & {
    aiTokens: Array<AiTokenGrouped>;
  }
) => {
  const { aiTokens, edition } = props;
  if (aiTokens.length === 0) {
    return <p>No AI tokens.</p>;
  }
  return (
    <section>
      <table className="tokens-table">
        <thead>
          <tr>
            <th></th>
            <th>Token</th>
            <th>Sample Answers</th>
            <th>Rename to</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {aiTokens.map((token, i) => (
            <Token key={token.tokenId} {...props} token={token} i={i} />
          ))}
        </tbody>
      </table>
    </section>
  );
};

const Token = (props: {
  edition: EditionMetadata;
  token: AiTokenGrouped;
  setTokenFilter: CommonNormalizationProps["setTokenFilter"];
  questionTokens: Token[];
  i: number;
}) => {
  const { edition, token, setTokenFilter, i, questionTokens } = props;
  const { tokenId, answers } = token;
  const [showAll, setShowAll] = useState(false);
  const [renameTo, setRenameTo] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegular = questionTokens.map((t) => t.id).includes(tokenId);
  return (
    <tr
      key={`${tokenId}_${i}`}
      className={`ai-token-row ai-token-row-${isRegular ? "regular" : "ai"}`}
    >
      <td>{i + 1}.</td>
      <td className="tokens-table-tokenId">
        <NormTokenAction
          id={tokenId}
          isAI={true}
          setTokenFilter={setTokenFilter}
          hideAction={true}
        />
      </td>
      <td>
        <table>
          <tbody>
            {(showAll ? answers : answers.slice(0, showAnswersCount)).map(
              (a, i) => (
                <tr key={a._id}>
                  <td>{i + 1}.</td>
                  <td>
                    <ResponseId id={a.responseId} />
                  </td>
                  <td>
                    <p className="field-value-items">
                      <blockquote>{a.raw}</blockquote>
                    </p>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
        {showAll ? (
          <button
            className="outline secondary"
            onClick={() => setShowAll(false)}
          >
            Hide ({answers.length})
          </button>
        ) : (
          <button
            className="outline secondary"
            onClick={() => setShowAll(true)}
          >
            Show All ({answers.length})
          </button>
        )}
      </td>
      <td>
        <label>
          <input
            type="text"
            disabled={loading}
            value={renameTo}
            onChange={(e) => {
              setRenameTo(e.target.value);
            }}
          />
        </label>
        <LoadingButton
          action={async () => {
            setLoading(true);
            const tokens = [{ from: tokenId, to: renameTo }];
            const result = await renameTokens({
              tokens,
            });
            setLoading(false);
            return result;
          }}
          label="Rename"
          tooltip="Rename token"
        />
      </td>
      <td>
        <LoadingButton
          action={async () => {
            if (
              confirm(`Really delete token ${tokenId} everywhere it appears?`)
            ) {
              setLoading(true);
              const result = await deleteTokens({
                editionId: edition.id,
                tokens: [tokenId],
              });
              setLoading(false);
              return result;
            }
          }}
          label="Delete"
          tooltip="Delete token"
        />
      </td>
    </tr>
  );
};
