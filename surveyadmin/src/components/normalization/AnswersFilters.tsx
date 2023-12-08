"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AnswersProps } from "./Answers";
import { IndividualAnswerWithIndex } from "~/lib/normalization/helpers/splitResponses";
import {
  EditionMetadata,
  SurveyMetadata,
  Entity,
  QuestionWithSection,
} from "@devographics/types";
import Tokens from "./Tokens";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface AnswersFiltersProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  entities: Entity[];
  variant: AnswersProps["variant"];
  filteredAnswers: IndividualAnswerWithIndex[];
  sortedAnswers: IndividualAnswerWithIndex[];
  filterQuery: string;
  setFilterQuery: Dispatch<SetStateAction<string>>;
  showCustomOnly: boolean;
  setShowCustomOnly: Dispatch<SetStateAction<boolean>>;
  question: QuestionWithSection;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

const AnswersFilters = ({
  survey,
  edition,
  question,
  entities,
  variant,
  sortedAnswers,
  filteredAnswers,
  filterQuery,
  setFilterQuery,
  showCustomOnly,
  setShowCustomOnly,
  pageNumber,
  setPageNumber,
  totalPages,
}: AnswersFiltersProps) => {
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
      setFilterQuery(localFilterQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localFilterQuery]);

  return (
    <div className="normalization-filter" ref={myRef}>
      <div>
        <strong>{capitalizeFirstLetter(variant)} Responses</strong>
        <code>{question.id}</code>
      </div>
      <Tokens {...{ survey, edition, question, entities }} />

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

      <label className="results-count" htmlFor="search">
        {sortedAnswers.length} results
      </label>
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
