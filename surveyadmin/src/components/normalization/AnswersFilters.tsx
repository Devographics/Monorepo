"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AnswersProps } from "./Answers";
import { IndividualAnswerWithIndex } from "~/lib/normalization/helpers/splitResponses";
import { QuestionMetadata } from "@devographics/types";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface AnswersFiltersProps {
  variant: AnswersProps["variant"];
  filteredAnswers: IndividualAnswerWithIndex[];
  sortedAnswers: IndividualAnswerWithIndex[];
  filterQuery: string;
  setFilterQuery: Dispatch<SetStateAction<string>>;
  showCustomOnly: boolean;
  setShowCustomOnly: Dispatch<SetStateAction<boolean>>;
  question: QuestionMetadata;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

const AnswersFilters = ({
  variant,
  sortedAnswers,
  filteredAnswers,
  filterQuery,
  setFilterQuery,
  showCustomOnly,
  setShowCustomOnly,
  question,
  pageNumber,
  setPageNumber,
  totalPages,
}: AnswersFiltersProps) => {
  const [localFilterQuery, setLocalFilterQuery] = useState(String(pageNumber));
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
      setFilterQuery(localFilterQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localFilterQuery]);

  return (
    <div className="normalization-filter" ref={myRef}>
      <label htmlFor="search">
        <code>{question.id}</code>
        <strong>{capitalizeFirstLetter(variant)} Responses</strong>:{" "}
        {sortedAnswers.length} results
      </label>
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
      <label>
        <input
          type="checkbox"
          checked={showCustomOnly}
          onChange={(e) => {
            e.preventDefault();
            setShowCustomOnly(e.target.checked);
          }}
        />
        Show custom tokens only
      </label>
      <div className="pagination">
        <button
          className="button-ghost"
          onClick={(e) => {
            e.preventDefault();
            if (pageNumber > 1) {
              setPageNumber(pageNumber - 1);
              window.scrollTo(0, topOfTable);
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
              window.scrollTo(0, topOfTable);
            }
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default AnswersFilters;
