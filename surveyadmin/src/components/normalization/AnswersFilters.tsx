"use client";
import { Dispatch, SetStateAction } from "react";
import { AnswersProps } from "./Answers";
import { IndividualAnswer } from "~/lib/normalization/helpers/splitResponses";

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
}

const AnswersFilters = ({
  variant,
  filteredAnswers,
  filterQuery,
  setFilterQuery,
  showCustomOnly,
  setShowCustomOnly,
}: AnswersFiltersProps) => {
  return (
    <div className="normalization-filter">
      <label htmlFor="search">
        Filter <strong>{capitalizeFirstLetter(variant)} Responses</strong>: (
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
