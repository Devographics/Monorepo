"use client";
import { Dispatch, SetStateAction } from "react";
import { AnswersProps } from "./Answers";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";
import { QuestionMetadata } from "@devographics/types";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface AnswersFiltersProps {
  variant: AnswersProps["variant"];
  filteredAnswers: IndividualAnswer[];
  filterQuery: string;
  setFilterQuery: Dispatch<SetStateAction<string>>;
  showCustomOnly: boolean;
  setShowCustomOnly: Dispatch<SetStateAction<boolean>>;
  question: QuestionMetadata;
}

const AnswersFilters = ({
  variant,
  filteredAnswers,
  filterQuery,
  setFilterQuery,
  showCustomOnly,
  setShowCustomOnly,
  question,
}: AnswersFiltersProps) => {
  return (
    <div className="normalization-filter">
      <label htmlFor="search">
        Filter <code>{question.id}</code>
        <strong>{capitalizeFirstLetter(variant)} Responses</strong>: (
        {filteredAnswers.length} results)
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
    </div>
  );
};

export default AnswersFilters;
