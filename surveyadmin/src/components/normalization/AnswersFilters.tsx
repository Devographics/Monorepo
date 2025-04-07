"use client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { getPercent, getSortedAnswers } from "./Answers";
import { IndividualAnswerWithIndex } from "~/lib/normalization/helpers/splitResponses";
import TokensTrigger from "./Tokens";
import LoadingButton from "../LoadingButton";
import { normalizeQuestionResponses } from "~/lib/normalization/services";
import {
  AnswerVariant,
  CommonNormalizationProps,
  answerVariants,
  getDataCacheKey,
} from "./NormalizeQuestion";
import { useQueryClient } from "@tanstack/react-query";
import { ResponsesData } from "~/lib/normalization/hooks";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

interface AnswersFiltersProps extends CommonNormalizationProps {
  variant: AnswerVariant;
  setVariant: Dispatch<SetStateAction<AnswerVariant>>;
  filteredAnswers: IndividualAnswerWithIndex[];
  paginatedAnswers: IndividualAnswerWithIndex[];
  sortedAnswers: IndividualAnswerWithIndex[];
  filterQuery?: string;
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
    addToActionLog,
  } = props;
  const queryClient = useQueryClient();
  const [localFilterQuery, setLocalFilterQuery] = useState(filterQuery || "");
  const [localPageNumber, setLocalPageNumber] = useState(String(pageNumber));
  const [topOfTable, setTopOfTable] = useState(0);
  const [hasReceivedInput, setHasReceivedInput] = useState(false);

  // when filterQuery changes (we're receiving a filter from somewhere else)
  // also change local state to reflect the change
  useEffect(() => {
    setLocalFilterQuery(filterQuery || "");
  }, [filterQuery]);

  useEffect(() => {
    setLocalPageNumber(String(pageNumber));
  }, [pageNumber]);
  const myRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const top = myRef?.current?.getBoundingClientRect().y || 0;
    setTopOfTable(top + document.documentElement.scrollTop);
  }, []);

  // wait until user has stopped typing to filter
  // note: only do it if the input has actually received input,
  // not if localFilterQuery is changing for other reasons
  useEffect(() => {
    if (hasReceivedInput) {
      const delayDebounceFn = setTimeout(() => {
        setPageNumber(1);
        setFilterQuery(localFilterQuery);
        setHasReceivedInput(false);
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [localFilterQuery, hasReceivedInput]);

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

      {/* <div className="control control-tokens">
        <TokensTrigger {...props} />
      </div> */}

      <div className="control control-search">
        <input
          type="search"
          id="search"
          placeholder="Filter by keyword…"
          value={localFilterQuery}
          onChange={(e) => {
            const value = e.target.value;
            setHasReceivedInput(true);
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
            const commonParams = {
              surveyId: survey.id,
              editionId: edition.id,
              questionId: question.id,
            };

            const results = await normalizeQuestionResponses({
              surveyId: survey.id,
              editionId: edition.id,
              questionId: question.id,
              responsesIds: filteredAnswers.map((a) => a.responseId),
              isVerbose: false,
            });
            addToActionLog({ type: "normalization", payload: results });
            if (results.data) {
              const { normalizedDocuments } = results.data;
              if (normalizedDocuments && normalizedDocuments.length > 0) {
                normalizedDocuments.forEach((normalizedDocument) => {
                  const { normalizedFields, responseId } = normalizedDocument;
                  if (normalizedFields) {
                    const normalizedField = normalizedFields[0];
                    queryClient.setQueryData(
                      [getDataCacheKey(commonParams)],
                      (previous: ResponsesData) => {
                        const { responses } = previous;
                        return {
                          ...previous,
                          responses: responses.map((r) =>
                            responseId === r.responseId
                              ? {
                                  ...r,
                                  metadata: normalizedField.metadata,
                                }
                              : r
                          ),
                        };
                      }
                    );
                  }
                });
              } else {
                console.log("No normalizedDocuments returned");
                console.log(results);
              }
            }
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
