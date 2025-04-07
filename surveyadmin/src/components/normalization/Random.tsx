"use client";
import { QuestionWithSection } from "@devographics/types";
import ModalTrigger from "../ui/ModalTrigger";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import sampleSize from "lodash/sampleSize";
import { useState } from "react";

const defaultCount = 1000;

export const Random = (props: {
  question: QuestionWithSection;
  allAnswers: IndividualAnswer[];
  normalizedAnswers: IndividualAnswer[];
  unnormalizedAnswers: IndividualAnswer[];
}) => {
  const [variant, setVariant] = useState("unnormalized");
  const [count, setCount] = useState(defaultCount);

  const { question, allAnswers, normalizedAnswers, unnormalizedAnswers } =
    props;

  const getSample = () => sampleSize(props[`${variant}Answers`], count);
  const regenerate = () => {
    setItems(getSample());
  };

  const [items, setItems] = useState(getSample());

  const contentProps = {
    ...props,
    setVariant,
    count,
    setCount,
    regenerate,
    items,
  };
  return (
    <div>
      <ModalTrigger
        isButton={false}
        label="🎲 Get Sample"
        tooltip="Get a random sample of answers"
        onOpen={regenerate}
        header={
          <span>
            Random sample of {count} answers for <code>{question.id}</code>
          </span>
        }
      >
        <Contents {...contentProps} />
      </ModalTrigger>
    </div>
  );
};

const Contents = ({ setVariant, count, setCount, regenerate, items }) => {
  console.log(items);
  return (
    <>
      <p>
        <h3>ChatGPT Prompt</h3>
        <textarea
          style={{ height: 150 }}
          value={`You are a highly experienced web developer. I will paste in the contents of a JSON file which contains answers obtained through a web development survey. 
            
The input JSON file is an array of items, each of which has an \`index\` field containing the item's position in the array; an \`answer\` field containing a survey answer, and a \`answerId\` field containing a unique id identifying the answer. 

Please do the following:

1. Extract the top 20 themes that appear in the \`answer\` fields, and generate unique theme tokens for each of them. Note: please make the theme tokens descriptive, such as \`monetary_cost\` or \`slow_response_time\`, not numerical or random codes such as \`id001\` or \`xhd686\`.

2. Go through the input JSON file, and for each item add a new \`tokenIds\` field containing the tokens for all themes matched by this item's \`answer\` field.

3. Return a new JSON file containing a \`tokens\` field containing the results of step 1 as an array, and a \`matches\` array containing the result of step 2.`}
          onFocus={(event) => event.target.select()}
        />
      </p>
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
        <input
          value={count}
          onChange={(event) => {
            setCount(Number(event.target.value));
          }}
        />
        <button onClick={regenerate}>Regenerate {count} Answers</button>
      </p>

      <textarea
        style={{ width: 600, height: 500 }}
        value={JSON.stringify(
          items.map(({ raw, answerIndex, responseId }, index) => ({
            index: index + 1,
            answer: raw,
            answerId: `${responseId}___${answerIndex}`,
          })),
          null,
          2
        )}
        onFocus={(event) => event.target.select()}
      />

      <textarea
        style={{ width: 600, height: 500 }}
        value={items.map((a, index) => `${index + 1}. ${a.raw}`).join("\n")}
        onFocus={(event) => event.target.select()}
      />
    </>
  );
};
