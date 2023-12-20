"use client";
import Dialog from "../ui/Dialog";
import { PresetsShortlist } from "./PresetsShortlist";
import AnswersFilters from "./AnswersFilters";
import { IndividualAnswerWithIndex } from "~/lib/normalization/helpers/splitResponses";
import { Dispatch, SetStateAction } from "react";
import { AnswersProps } from "./Answers";
import {
  SurveyMetadata,
  EditionMetadata,
  QuestionWithSection,
  Entity,
  ResponseData,
} from "@devographics/types";
import Tokens from "./Tokens";

interface AnswersTableHeadingProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  entities: Entity[];
  variant: AnswersProps["variant"];
  filteredAnswers: IndividualAnswerWithIndex[];
  sortedAnswers: IndividualAnswerWithIndex[];
  filterQuery: string;
  setFilterQuery: Dispatch<SetStateAction<string>>;
  showCustomOnly: boolean;
  setShowCustomOnly: Dispatch<SetStateAction<boolean>>;
  setShowShortlist: Dispatch<SetStateAction<boolean>>;
  showShortlist: boolean;
  questionData?: ResponseData;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
  totalPages: number;
}

export const AnswersTableHeading = (props: AnswersTableHeadingProps) => {
  const { setShowShortlist, showShortlist } = props;
  return (
    <thead>
      <tr>
        <th colSpan={99}>
          <AnswersFilters {...props} />
        </th>
      </tr>
      <tr>
        <th>ID</th>
        <th>Answer</th>
        <th>
          <div className="token-actions">
            <span>Tokens</span>
            <a
              href="#"
              style={{ whiteSpace: "nowrap" }}
              onClick={(e) => {
                e.preventDefault();
                setShowShortlist(!showShortlist);
              }}
              data-tooltip="Edit presets…"
            >
              Edit Shortlist…
            </a>
            {showShortlist && (
              <Dialog
                showModal={showShortlist}
                setShowModal={setShowShortlist}
                header={<span>Token Presets</span>}
              >
                <PresetsShortlist {...props} />
              </Dialog>
            )}
            <Tokens {...props} isButton={false} />
          </div>
        </th>
        {/* <th>Current Tokens</th> */}

        <th>Actions</th>
      </tr>
    </thead>
  );
};
