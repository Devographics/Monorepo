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
  const [variant, setVariant] = useState("all");
  const [count, setCount] = useState(defaultCount);

  const { question, allAnswers, normalizedAnswers, unnormalizedAnswers } =
    props;

  const getSample = () => sampleSize(props[`${variant}Answers`], count);
  const regenerate = () => {
    setItems(getSample());
  };

  const [items, setItems] = useState(getSample());

  return (
    <div>
      <ModalTrigger
        isButton={false}
        label="🎲 Get Random Sample…"
        tooltip="Get a random sample of answers"
        onOpen={regenerate}
        header={
          <span>
            Random sample of {count} answers for <code>{question.id}</code>
          </span>
        }
      >
        <>
          <p>
            <h3>ChatGPT Prompt</h3>
            <textarea
              style={{ height: 150 }}
              value="
            You are a highly experienced web developer. I will paste in
            answers obtained through a web development survey. Please provide a
            list of the top 10 broad topics or challenges that web developers
            commonly face based on that data. As I paste in more data, please
            consider all data provided since the start of this conversation."
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
              <option value="all">All Answers</option>
              <option value="normalized">Normalized Answers</option>
              <option value="unnormalized">Unnormalized Answers</option>
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
            value={items.map((a, index) => `${index + 1}. ${a.raw}`).join("\n")}
            onFocus={(event) => event.target.select()}
          />
        </>
      </ModalTrigger>
    </div>
  );
};
