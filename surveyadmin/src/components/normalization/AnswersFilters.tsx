"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AnswersProps } from "./Answers";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { QuestionMetadata } from "@devographics/types";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface AnswersFiltersProps {
  variant: AnswersProps["variant"];
  filteredAnswers: IndividualAnswer[];
  sortedAnswers: IndividualAnswer[];
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
  const [localValue, setLocalValue] = useState(String(pageNumber));
  const [topOfTable, setTopOfTable] = useState(0);
  useEffect(() => {
    setLocalValue(String(pageNumber));
  }, [pageNumber]);
  const myRef = useRef(null);

  useEffect(() => {
    const top = myRef?.current?.getBoundingClientRect().y;
    setTopOfTable(top + document.documentElement.scrollTop);
  }, []);

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
        value={filterQuery}
        onChange={(e) => setFilterQuery(e.target.value)}
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
              value={localValue}
              onChange={(e) => {
                e.preventDefault;
                const value = e.target.value;
                setLocalValue(value);
                if (value) {
                  const limitedValue = Math.min(Number(value), totalPages);
                  setPageNumber(limitedValue);
                }
              }}
              onBlur={(e) => {
                e.preventDefault;
                if (!localValue) {
                  setLocalValue(String(pageNumber));
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
