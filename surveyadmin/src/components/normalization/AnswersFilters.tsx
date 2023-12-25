"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { getPercent, getSortedAnswers } from "./Answers";
import { IndividualAnswerWithIndex } from "~/lib/normalization/helpers/splitResponses";
import Tokens from "./Tokens";
import LoadingButton from "../LoadingButton";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import {
  AnswerVariant,
  CommonNormalizationProps,
  answerVariants,
} from "./NormalizeQuestion";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface AnswersFiltersProps extends CommonNormalizationProps {
  variant: AnswerVariant;
  setVariant: Dispatch<SetStateAction<AnswerVariant>>;
  filteredAnswers: IndividualAnswerWithIndex[];
  paginatedAnswers: IndividualAnswerWithIndex[];
  sortedAnswers: IndividualAnswerWithIndex[];
  filterQuery: string;
  setFilterQuery: Dispatch<SetStateAction<string>>;
  showCustomOnly: boolean;
  setShowCustomOnly: Dispatch<SetStateAction<boolean>>;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

const getStats = ({ sortedAnswers, allAnswers }) => ({
  percentage: getPercent(sortedAnswers.length, allAnswers.length),
  count: sortedAnswers.length,
  total: allAnswers.length,
});

const AnswersFilters = (props: AnswersFiltersProps) => {
  const {
    survey,
    edition,
    question,
    entities,
    sortedAnswers,
    filteredAnswers,
    filterQuery,
    setFilterQuery,
    showCustomOnly,
    setShowCustomOnly,
    pageNumber,
    setPageNumber,
    totalPages,
    variant,
    setVariant,
    allAnswers,
  } = props;
  const [localFilterQuery, setLocalFilterQuery] = useState("");
  const [localPageNumber, setLocalPageNumber] = useState(String(pageNumber));
  const [topOfTable, setTopOfTable] = useState(0);
  useEffect(() => {
    setLocalPageNumber(String(pageNumber));
  }, [pageNumber]);
  const myRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const top = myRef?.current?.getBoundingClientRect().y || 0;
    setTopOfTable(top + document.documentElement.scrollTop);
  }, []);

  // wait until user has stopped typing to filter
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      console.log(localFilterQuery);
      setPageNumber(1);
      setFilterQuery(localFilterQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localFilterQuery]);

  return (
    <div className="normalization-controls" ref={myRef}>
      {/* <div className="control control-info">
        <code>{question.id}</code>
      </div> */}

      {/* <details role="list">
        <summary aria-haspopup="listbox">{variant}</summary>
        <ul role="listbox">
          <li>
            <a>Unnormalized Answers</a>
          </li>
          <li>
            <a>Normalized Answers</a>
          </li>
          <li>
            <a>Discarded Answers</a>
          </li>
        </ul>
      </details> */}

      <div
        className="control control-variant"
        data-tooltip={answerVariants.find((v) => v.id === variant)?.tooltip}
      >
        <select
          onChange={(e) => {
            setVariant(e.target.value as AnswerVariant);
          }}
          value={variant}
        >
          {answerVariants.map(({ id, label }) => {
            const variantAnswers = props[`${id}Answers`];
            const { percentage, count, total } = getStats({
              sortedAnswers: getSortedAnswers(variantAnswers),
              allAnswers,
            });
            return (
              <option key={id} value={id}>
                {label} ({percentage}% – {count}/{total})
              </option>
            );
          })}
        </select>
      </div>

      <div className="control control-tokens">
        <Tokens {...props} />
      </div>

      <div className="control control-search">
        <input
          type="search"
          id="search"
          placeholder="Filter by keyword…"
          value={localFilterQuery}
          onChange={(e) => {
            const value = e.target.value;
            setLocalFilterQuery(value);
            // setFilterQueryDebounced(value);
          }}
        />
      </div>

      <div className="control control-count">
        <label className="results-count" htmlFor="search">
          {filteredAnswers.length} results
        </label>
      </div>
      {/* <label>
        <input
          type="checkbox"
          checked={showCustomOnly}
          onChange={(e) => {
            e.preventDefault();
            setShowCustomOnly(e.target.checked);
          }}
        />
        Show custom tokens only
      </label> */}
      <Pagination
        {...{
          ...props,
          localPageNumber,
          setLocalPageNumber,
          topOfTable,
          setTopOfTable,
        }}
      />
      <div className="control control-renormalize">
        <LoadingButton
          action={async () => {
            const result = await normalizeQuestionResponses({
              surveyId: survey.id,
              editionId: edition.id,
              questionId: question.id,
              responsesIds: filteredAnswers.map((a) => a.responseId),
              isVerbose: false,
            });
          }}
          label="🔄"
          tooltip="Renormalize Current Answers"
        />
      </div>
    </div>
  );
};

const Pagination = (
  props: AnswersFiltersProps & {
    localPageNumber: string;
    setLocalPageNumber: Dispatch<SetStateAction<string>>;
    topOfTable: number;
  }
) => {
  const {
    pageNumber,
    setPageNumber,
    totalPages,
    localPageNumber,
    setLocalPageNumber,
    topOfTable,
  } = props;
  return (
    <div className="control pagination">
      <button
        className="button-ghost"
        onClick={(e) => {
          e.preventDefault();
          if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
            const currentScroll = document.documentElement.scrollTop;
            if (currentScroll > topOfTable) {
              window.scrollTo(0, topOfTable);
            }
          }
        }}
      >
        &lt;
      </button>
      <div className="pagination-number">
        <span>
          <input
            type="text"
            value={localPageNumber}
            onChange={(e) => {
              e.preventDefault;
              const value = e.target.value;
              setLocalPageNumber(value);
              if (value) {
                const limitedValue = Math.min(Number(value), totalPages);
                setPageNumber(limitedValue);
              }
            }}
            onBlur={(e) => {
              e.preventDefault;
              if (!localPageNumber) {
                setLocalPageNumber(String(pageNumber));
              }
            }}
          />
        </span>
        <span>/</span>
        <span>{totalPages}</span>
      </div>
      <button
        className="button-ghost"
        onClick={(e) => {
          e.preventDefault();
          if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
            const currentScroll = document.documentElement.scrollTop;
            if (currentScroll > topOfTable) {
              window.scrollTo(0, topOfTable);
            }
          }
        }}
      >
        &gt;
      </button>
    </div>
  );
};
export default AnswersFilters;
