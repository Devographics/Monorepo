"use client";
import { Dispatch, SetStateAction, useState } from "react";
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
  return (
    <div className="normalization-filter">
      <label htmlFor="search">
        Filter <code>{question.id}</code>
        <strong>{capitalizeFirstLetter(variant)} Responses</strong>:{" "}
        {sortedAnswers.length} results
      </label>
      <input
        type="search"
        id="search"
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
