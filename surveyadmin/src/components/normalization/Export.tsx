"use client";
import { QuestionWithSection, Entity } from "@devographics/types";
import ModalTrigger from "../ui/ModalTrigger";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { useEffect, useState } from "react";
import { EMPTY_TAG, getQuestionTokens } from "./Tokens";

const defaultCount = 200;

const getFreePrompt =
  () => `You are a highly experienced web developer. I will paste in the contents of a JSON file which contains answers obtained through a web development survey. 
            
The input JSON file is an array of items, each of which has an \`index\` field containing the item's position in the array; an \`answer\` field containing a survey answer, and a \`answerId\` field containing a unique id identifying the answer. 

Please do the following:

1. Extract the top 20 themes that appear in the \`answer\` fields, and generate unique theme tokens for each of them. Note: please make the theme tokens descriptive, such as \`monetary_cost\` or \`slow_response_time\`, not numerical or random codes such as \`id001\` or \`xhd686\`.

2. Go through the input JSON file, and for each item add a new \`tokenIds\` field containing the tokens for all themes matched by this item's \`answer\` field.

3. Return a new JSON file containing a \`tokens\` field containing the results of step 1 as an array, and a \`matches\` array containing the result of step 2.`;

const getForcedPrompt = (
  tokens
) => `You are a highly experienced web developer. I will first paste in an array of individual string tokens related to web development themes and issues. For example, \`slow_response_time\` or \`excessive_complexity\`. 

Then, I will paste in the contents of a JSON file which contains answers obtained through a web development survey. The input JSON file is an array of items, each of which has an \`index\` field containing the item's position in the array; an \`answer\` field containing a survey answer, and a \`answerId\` field containing a unique id identifying the answer. 

Please do the following:

1. Go through the input JSON file, and for each item, find all the tokens belonging to the token array I provided that thematically match the contents of the item's \`answer\` field. Add a new \`tokenIds\` field containing these tokens.

2. Return a new JSON file containing a \`tokens\` field containing the original tokens array I provided, and a \`matches\` array containing the result of step 1.`;

export const Export = (props: {
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

  const getSample = (variant, count, page) =>
    getAllItems(variant).slice((page - 1) * count, page * count);

  const [variant, setVariant] = useState("unnormalized");
  const [count, setCount] = useState(defaultCount);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(getSample(variant, count, page));

  const allItems = getAllItems(variant);

  useEffect(() => {
    setItems(getSample(variant, count, page));
  }, [variant, count, page]);

  const totalPages =
    count && count > 0 ? Math.ceil(allItems.length / count) : 1;

  const allTokens = getQuestionTokens({
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
  setVariant,
  totalPages,
  page,
  setPage,
  count,
  setCount,
  allItems,
  items,
  allTokens,
}) => {
  const [forceTokens, setForceTokens] = useState(false);
  return (
    <>
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
          value={forceTokens ? getForcedPrompt(allTokens) : getFreePrompt()}
          onFocus={(event) => event.target.select()}
        />
        {forceTokens && (
          <div>
            <h5>Tokens</h5>
            <textarea
              style={{ width: 600, height: 300 }}
              value={JSON.stringify(
                allTokens.map((t) => t.id).filter((id) => id !== EMPTY_TAG),
                null,
                2
              )}
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
        Page {page}/{totalPages}, answers {(page - 1) * count + 1}-
        {Math.min(page * count, allItems.length)}:
      </p>

      <textarea
        style={{ width: 700, height: 500 }}
        value={JSON.stringify(
          items.map(({ raw, answerIndex, index, responseId }) => ({
            index,
            answer: raw,
            answerId: `${responseId}___${answerIndex}`,
          })),
          null,
          2
        )}
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
