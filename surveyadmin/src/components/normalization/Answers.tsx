"use client";
import { useState } from "react";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { getFormPaths } from "@devographics/templates";
import { useCopy } from "../hooks";
import { CommonProps } from "./NormalizeQuestion";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import sortBy from "lodash/sortBy";
import { Answer } from "./Answer";
import trim from "lodash/trim";
import { CUSTOM_NORMALIZATION } from "@devographics/constants";
import { AnswersTableHeading } from "./AnswersTableHeading";

const ITEMS_PER_PAGE = 200;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const getPercent = (a, b) => Math.round((a / b) * 100);

export interface AnswersProps extends CommonProps {
  allAnswers: IndividualAnswer[];
  variant: "normalized" | "unnormalized" | "discarded";
}

const Answers = (props: AnswersProps) => {
  const [showResponses, setShowResponses] = useState(false);
  const [showIds, setShowIds] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [showShortlist, setShowShortlist] = useState(false);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const showPresetsShortlistModal = () => {
    setShowShortlist(true);
  };

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
    customNormalizations,
  } = props;

  const variantAnswers = props[`${variant}Answers`];

  if (!variantAnswers) return <p>Nothing to normalize</p>;

  const sortedAnswers = sortBy(variantAnswers, (a) =>
    trim(a.raw.toLowerCase().replaceAll('"', ""))
  ).map((a, index) => ({
    ...a,
    index,
  })) as IndividualAnswer[];

  const totalPages = Math.ceil(sortedAnswers.length / ITEMS_PER_PAGE);

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const formPaths = getFormPaths({ edition, question: questionObject });
  const rawPath = formPaths?.other;
  const normPath = questionObject.normPaths?.other;

  if (!rawPath || !normPath)
    return (
      <p>
        Missing <code>rawPath</code> or <code>normPath</code>
      </p>
    );

  const answerProps = {
    ...props,
    showPresetsShortlistModal,
    rawPath,
    normPath,
  };

  let filteredAnswers = sortedAnswers;

  if (filterQuery || showCustomOnly) {
    if (filterQuery) {
      filteredAnswers = filteredAnswers.filter((a) =>
        a.raw.toLowerCase().includes(filterQuery.toLowerCase())
      );
    }
    if (showCustomOnly) {
      filteredAnswers = filteredAnswers.filter((a) =>
        a?.tokens?.some((t) => t.pattern === CUSTOM_NORMALIZATION)
      );
    }
  } else {
    filteredAnswers = filteredAnswers.slice(
      (pageNumber - 1) * ITEMS_PER_PAGE,
      pageNumber * ITEMS_PER_PAGE
    );
  }

  return (
    <div>
      <h3>
        {capitalizeFirstLetter(variant)} Responses (
        {getPercent(sortedAnswers.length, allAnswers.length)}% –{" "}
        {sortedAnswers.length}/{allAnswers.length}){" "}
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

          <table className="normalization-table">
            <AnswersTableHeading
              {...{
                survey,
                edition,
                question,
                entities,
                variant,
                filteredAnswers,
                sortedAnswers,
                filterQuery,
                setFilterQuery,
                showCustomOnly,
                setShowCustomOnly,
                setShowShortlist,
                showShortlist,
                questionData,
                pageNumber,
                setPageNumber,
                totalPages,
              }}
            />
            <tbody>
              {filteredAnswers.map((answer, pageIndex) => {
                const { _id, responseId, raw, tokens, index } = answer;
                const previousRawValue = sortedAnswers[index - 1]?.raw;
                // show letter heading if this value's first letter is different from previous one
                const letterIsDifferent =
                  previousRawValue &&
                  trim(raw)?.[0]?.toUpperCase() !==
                    trim(previousRawValue)?.[0]?.toUpperCase();
                const showLetterHeading = pageIndex === 0 || letterIsDifferent;

                const customNormalization = customNormalizations?.find(
                  (c) => c.responseId === responseId
                );
                return (
                  <Answer
                    key={index}
                    answer={answer}
                    index={index}
                    customNormalization={customNormalization}
                    {...(showLetterHeading
                      ? { letterHeading: raw?.[0].toUpperCase() }
                      : {})}
                    {...answerProps}
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
export default Answers;
