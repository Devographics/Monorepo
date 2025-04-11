"use client";
import {
  QuestionWithSection,
  Entity,
  QuestionMetadata,
  EditionMetadata,
} from "@devographics/types";
import ModalTrigger from "../ui/ModalTrigger";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { useEffect, useState } from "react";
import { EMPTY_TAG, getSortedQuestionTokens } from "./Tokens";

const defaultCount = 200;

const downloadJson = (dataString: string, filename = "data.json") => {
  const blob = new Blob([dataString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url); // Clean up
};

type PromptProps = {
  question: QuestionMetadata;
  edition: EditionMetadata;
  count: number;
  from: number;
  to: number;
};
const getFreePrompt = ({
  question,
  edition,
  count,
  from,
  to,
}: PromptProps) => `You are a highly experienced web developer. I will provide the contents of a JSON file which contains answers obtained through a web development survey. 
            
The input JSON file is an array of ${count} items, each of which has an \`index\` field containing the item's position in the array; an \`answer\` field containing a survey answer, and a \`answerId\` field containing a unique id identifying the answer. 

Please do the following:

1. Extract the top 20 themes that appear in the \`answer\` fields, and generate unique theme tokens for each of them. Note: please make the theme tokens descriptive, such as \`monetary_cost\` or \`slow_response_time\`, not numerical or random codes such as \`id001\` or \`xhd686\`. Store these 20 tokens in an array of items, where each item contains an \`id\` field with the token and a \`patterns\` field containing an array of all the keywords used to match the token. 

2. Go through the input JSON file, and for each one of the ${count} answers, add a new \`tokenIds\` field containing the tokens for all themes matched by this item's \`answer\` field. Run the full analysis on all ${count} items, do not output a sample or a subset of the dataset. 

3. Return a new JSON file named \`${edition.id}__${question.id}__${from}_${to}__MODELNAME__result.json\` (where you replace \`MODELNAME\` by the name of the current LLM in use) containing a \`tokens\` field containing the results of step 1 as an array, and a \`matches\` array containing the result of step 2.

Please only show the final answer and skip the step-by-step explanation.`;

const getForcedPrompt = ({
  question,
  edition,
  count,
  from,
  to,
}: PromptProps) => `You are a highly experienced web developer. I will first paste in an array of individual string tokens related to web development themes and issues. For example, \`slow_response_time\` or \`excessive_complexity\`. 

Then, I will provide the contents of a JSON file which contains answers obtained through a web development survey. The input JSON file is an array of ${count} items, each of which has an \`index\` field containing the item's position in the array; an \`answer\` field containing a survey answer, and a \`answerId\` field containing a unique id identifying the answer. 

Please do the following:

1. Go through the input JSON file, and for each one of the ${count} answers, find all the tokens belonging to the token array I provided that thematically match the contents of the item's \`answer\` field. Add a new \`tokenIds\` field containing these tokens. Use partial semantic matches, synonyms, and fuzzy string matching to determine matches, not just strict string matching. Run the full analysis on all ${count} items, do not output a sample or a subset of the dataset. 

2. Return a new JSON file named \`${edition.id}__${question.id}__${from}_${to}__MODELNAME__result.json\` (where you replace \`MODELNAME\` by the name of the current LLM in use) containing a \`tokens\` field containing the original tokens array I provided, and a \`matches\` array containing the result of step 1.

Please only show the final answer and skip the step-by-step explanation`;

export const Export = (props: {
  edition: EditionMetadata;
  question: QuestionWithSection;
  allAnswers: IndividualAnswer[];
  normalizedAnswers: IndividualAnswer[];
  unnormalizedAnswers: IndividualAnswer[];
  entities: Entity[];
}) => {
  const {
    entities,
    question,
    allAnswers,
    normalizedAnswers,
    unnormalizedAnswers,
  } = props;

  const getAllItems = (variant) =>
    props[`${variant}Answers`].map((item, index) => ({
      ...item,
      index: index + 1,
    }));

  const [variant, setVariant] = useState("unnormalized");
  const [count, setCount] = useState(defaultCount);
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(count);

  const getSample = (variant, from, to) => getAllItems(variant).slice(from, to);

  const [items, setItems] = useState(getSample(variant, from, to));

  const allItems = getAllItems(variant);

  useEffect(() => {
    const from = (page - 1) * count;
    const to = Math.min(page * count, allItems.length);
    setFrom(from);
    setTo(to);
    setItems(getSample(variant, from, to));
  }, [variant, count, page]);

  const totalPages =
    count && count > 0 ? Math.ceil(allItems.length / count) : 1;

  const allTokens = getSortedQuestionTokens({
    question,
    allAnswers,
    entities,
  });

  const contentProps = {
    ...props,
    setVariant,
    count,
    setCount,
    totalPages,
    page,
    setPage,
    allItems,
    items,
    allTokens,
    from,
    to,
  };
  return (
    <div>
      <ModalTrigger
        isButton={false}
        label="📤 Export"
        tooltip="Export answers"
        header={
          <span>
            {allItems.length} answers for <code>{question.id}</code>
          </span>
        }
      >
        <Contents {...contentProps} />
      </ModalTrigger>
    </div>
  );
};

const Contents = ({
  question,
  edition,
  setVariant,
  totalPages,
  page,
  setPage,
  count,
  setCount,
  allItems,
  items,
  allTokens,
  from,
  to,
}) => {
  const [forceTokens, setForceTokens] = useState(false);

  const promptProps = { question, edition, from, to, count };

  const tokensFileName = `${edition.id}__${question.id}__tokens.json`;
  const allTokensString = JSON.stringify(
    allTokens.map((t) => t.id).filter((id) => id !== EMPTY_TAG),
    null,
    2
  );

  const answersFileName = `${edition.id}__${question.id}__${from}_${to}__input.json`;
  const allAnswersString = JSON.stringify(
    items.map(({ raw, answerIndex, index, responseId }) => ({
      index,
      answer: raw,
      answerId: `${responseId}___${answerIndex}`,
    })),
    null,
    2
  );

  return (
    <>
      <h1>Export</h1>
      <p>
        <h3>Prompt</h3>
        <p>
          <label>
            <input
              checked={forceTokens === false}
              type="radio"
              name="prompt_style"
              onChange={() => setForceTokens(false)}
            />
            Free tokens
          </label>
          <label>
            <input
              checked={forceTokens === true}
              type="radio"
              name="prompt_style"
              onChange={() => setForceTokens(true)}
            />
            Forced tokens
          </label>
        </p>
        <textarea
          style={{ height: 150 }}
          value={
            forceTokens
              ? getForcedPrompt(promptProps)
              : getFreePrompt(promptProps)
          }
          onFocus={(event) => event.target.select()}
        />
        {forceTokens && (
          <div>
            <h5>Tokens</h5>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                downloadJson(allTokensString, tokensFileName);
              }}
            >
              download <code>{tokensFileName}</code>
            </a>
            <textarea
              style={{ width: 600, height: 300 }}
              value={allTokensString}
              onFocus={(event) => event.target.select()}
            />
          </div>
        )}
      </p>
      <h3>Answers</h3>
      <p>
        Sample from:{" "}
        <select
          onChange={(event) => {
            setVariant(event.target.value);
          }}
        >
          <option value="unnormalized">Unnormalized Answers</option>
          <option value="all">All Answers</option>
          <option value="normalized">Normalized Answers</option>
        </select>
        Answers per page:
        <input
          value={count}
          onChange={(event) => {
            setCount(Number(event.target.value));
          }}
        />
        Page {page}/{totalPages}, answers {from + 1}-{to}:
      </p>

      <p>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            downloadJson(allAnswersString, answersFileName);
          }}
        >
          download <code>{answersFileName}</code>
        </a>
      </p>

      <textarea
        style={{ width: 700, height: 500 }}
        value={allAnswersString}
        onFocus={(event) => event.target.select()}
      />

      <div className="pagination">
        {totalPages &&
          [...Array(totalPages)].map((x, index) => (
            <button
              key={index}
              onClick={() => {
                setPage(index + 1);
              }}
              className={index + 1 === page ? "" : "outline secondary"}
            >
              {index + 1}
            </button>
          ))}
      </div>
      {/* 
      <textarea
        style={{ width: 600, height: 500 }}
        value={items.map((a, index) => `${index}. ${a.raw}`).join("\n")}
        onFocus={(event) => event.target.select()}
      /> */}
    </>
  );
};
