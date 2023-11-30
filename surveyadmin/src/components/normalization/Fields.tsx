"use client";
import { useState } from "react";
import {
  EditionMetadata,
  ResponseData,
  SurveyMetadata,
} from "@devographics/types";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";
import { getFormPaths } from "@devographics/templates";
import { useCopy } from "../hooks";
import { Entity } from "@devographics/types";
import { CustomNormalizations } from "./NormalizeQuestion";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import sortBy from "lodash/sortBy";
import { Field } from "./Field";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import trim from "lodash/trim";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const combineValue = (value: string | string[]) =>
  Array.isArray(value) ? value.join() : value;

const getPercent = (a, b) => Math.round((a / b) * 100);

const Fields = (props: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  responses: NormalizationResponse[];
  allAnswers: IndividualAnswer[];
  questionData: ResponseData;
  variant: "normalized" | "unnormalized";
  entities: Entity[];
  customNormalizations: CustomNormalizations;
}) => {
  const [showResponses, setShowResponses] = useState(false);
  const [showIds, setShowIds] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  const {
    survey,
    edition,
    question,
    responses,
    responsesCount,
    allAnswers,
    questionData,
    variant,
    entities,
  } = props;

  const answers = sortBy(props[`${variant}Answers`], (a) =>
    trim(a.raw.toLowerCase().replaceAll('"', ""))
  ) as IndividualAnswer[];

  if (!answers) return <p>Nothing to normalize</p>;

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const formPaths = getFormPaths({ edition, question: questionObject });

  const fieldProps = {
    answers,
    showIds,
    question,
    survey,
    edition,
    questionData,
    rawPath: formPaths?.other,
    variant,
    entities,
    filterQuery,
    responses,
  };

  const filteredAnswers = filterQuery
    ? answers.filter((a) =>
        a.raw.toLowerCase().includes(filterQuery.toLowerCase())
      )
    : answers;

  return (
    <div>
      <h3>
        {capitalizeFirstLetter(variant)} Responses (
        {getPercent(answers.length, allAnswers.length)}% – {answers.length}/
        {allAnswers.length}){" "}
        <a
          href="#"
          role="button"
          onClick={(e) => {
            e.preventDefault();
            setShowResponses(!showResponses);
          }}
        >
          {showResponses ? "Hide" : "Show"}
        </a>
      </h3>
      {showResponses && (
        <div className="normalization-fields">
          {variant === "normalized" ? (
            <p>
              This table shows responses that have already received at least one
              match during the normalization process.
            </p>
          ) : (
            <p>
              This table shows responses that have not received any match yet
              during the normalization process.
            </p>
          )}

          <div className="normalization-filter">
            <label htmlFor="search">
              Filter {capitalizeFirstLetter(variant)} Responses: (
              {filteredAnswers.length} results)
            </label>
            <input
              type="search"
              id="search"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Answer</th>
                {variant === "normalized" ? (
                  <th>Normalized Tokens</th>
                ) : (
                  <th>Add Token</th>
                )}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnswers.map((individualAnswer, index) => {
                const { _id, responseId, raw, tokens } = individualAnswer;
                const previousRawValue = filteredAnswers[index - 1]?.raw;
                // show letter heading if this value's first letter is different from previous one
                const showLetterHeading = previousRawValue
                  ? raw?.[0].toUpperCase() !==
                    previousRawValue?.[0].toUpperCase()
                  : true;
                return (
                  <Field
                    key={raw + index}
                    _id={_id}
                    raw={raw}
                    tokens={tokens}
                    responseId={responseId}
                    index={index}
                    letterHeading={showLetterHeading && raw?.[0].toUpperCase()}
                    {...fieldProps}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const ResponseId = ({ id }: { id: string }) => {
  const [copied, copy, setCopied] = useCopy(id);

  const truncated = id.slice(0, 6) + "…";
  return (
    <code data-tooltip="Click to copy" onClick={copy}>
      {truncated}
    </code>
  );
};
export default Fields;
