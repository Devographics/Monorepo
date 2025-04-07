"use client";
import { useState } from "react";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import { getFormPaths } from "@devographics/templates";
import { useCopy } from "../hooks";
import { CommonNormalizationProps } from "./NormalizeQuestion";
import {
  IndividualAnswer,
  IndividualAnswerWithIndex,
} from "~/lib/normalization/helpers/splitResponses";
import sortBy from "lodash/sortBy";
import { Answer } from "./Answer";
import trim from "lodash/trim";
import { CUSTOM_NORMALIZATION } from "@devographics/constants";
import { AnswersTableHeading } from "./AnswersTableHeading";
import LoadingButton from "../LoadingButton";
import { normalizeResponses } from "~/lib/normalization/services";

const ITEMS_PER_PAGE = 200;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const getPercent = (a: number, b: number) =>
  b ? Math.round((a / b) * 100) : 0;

export interface AnswersProps extends CommonNormalizationProps {
  allAnswers: IndividualAnswer[];
  unnormalizedAnswers: IndividualAnswer[];
  normalizedAnswers: IndividualAnswer[];
  discardedAnswers: IndividualAnswer[];
}

const getSimplifiedString = (s: string) => {
  if (s) {
    return trim(
      s
        .toLowerCase()
        .replaceAll(" ", "")
        .replaceAll("-", "")
        .replaceAll("@", "")
    );
  }
};

export const getSortedAnswers = (variantAnswers) => {
  return sortBy(variantAnswers, (a) =>
    trim(a.raw.toLowerCase().replaceAll('"', "").replaceAll("@", ""))
  ).map((a, index) => ({
    ...a,
    index,
  })) as IndividualAnswerWithIndex[];
};

const Answers = (props: AnswersProps) => {
  const {
    survey,
    edition,
    question,
    responses,
    responsesCount,
    allAnswers,
    questionData,
    entities,
    customNormalizations,
    unnormalizedAnswers,
    normalizedAnswers,
    discardedAnswers,
    tokenFilter,
    variant,
    setVariant,
    filterQuery,
    setFilterQuery,
  } = props;

  const [showResponses, setShowResponses] = useState(true);
  const [showIds, setShowIds] = useState(false);
  const [showShortlist, setShowShortlist] = useState(false);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const showPresetsShortlistModal = () => {
    setShowShortlist(true);
  };

  const variantAnswers = props[`${variant}Answers`];

  if (!variantAnswers) return <p>Nothing to normalize</p>;

  const sortedAnswers = getSortedAnswers(variantAnswers);

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

  if (filterQuery || showCustomOnly || tokenFilter) {
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
    if (tokenFilter) {
      filteredAnswers = filteredAnswers.filter((a) =>
        a?.tokens?.some((t) => tokenFilter.includes(t.id))
      );
    }
  }

  const paginatedAnswers = filteredAnswers.slice(
    (pageNumber - 1) * ITEMS_PER_PAGE,
    pageNumber * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredAnswers.length / ITEMS_PER_PAGE);

  return (
    <div>
      {/* <p>
        variant:
        {variant}
      </p>
      <p>
        tokenFilter:
        {tokenFilter?.join()}
      </p> */}
      {showResponses && (
        <div className="normalization-fields">
          <table className="normalization-table">
            <AnswersTableHeading
              {...{
                ...props,
                variant,
                filteredAnswers,
                sortedAnswers,
                paginatedAnswers,
                filterQuery,
                setFilterQuery,
                showCustomOnly,
                setShowCustomOnly,
                setShowShortlist,
                showShortlist,
                pageNumber,
                setPageNumber,
                totalPages,
                setVariant,
              }}
            />
            <tbody>
              {paginatedAnswers.map((answer, pageIndex) => {
                const { _id, responseId, raw, tokens, index, answerIndex } =
                  answer;
                const currentRawValue = getSimplifiedString(raw);
                const previousRawValue = getSimplifiedString(
                  sortedAnswers[index - 1]?.raw
                );
                const nextRawValue = getSimplifiedString(
                  sortedAnswers[index + 1]?.raw
                );
                // show letter heading if this value's first letter is different from previous one
                const letterIsDifferent =
                  previousRawValue &&
                  currentRawValue?.[0] !== previousRawValue?.[0];
                const showLetterHeading = pageIndex === 0 || letterIsDifferent;

                const isRepeating =
                  previousRawValue === currentRawValue ||
                  nextRawValue === currentRawValue;

                const customNormalization = customNormalizations?.find((c) => {
                  if (!c) {
                    console.warn(
                      "Found undefined custom normalization",
                      customNormalizations
                    );
                    return false;
                  }
                  return (
                    c.responseId === responseId && c.answerIndex === answerIndex
                  );
                });
                return (
                  <Answer
                    key={index}
                    answer={answer}
                    index={index}
                    customNormalization={customNormalization}
                    answerIndex={answerIndex}
                    isRepeating={isRepeating}
                    filterQuery={filterQuery}
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

export const ResponseId = ({ id = "" }: { id: string }) => {
  const [copied, copy, setCopied] = useCopy(id);

  const truncated = id.slice(0, 3) + "…";
  return (
    <code data-tooltip="Click to copy" onClick={copy}>
      {truncated}
    </code>
  );
};
export default Answers;
