"use client";
import { useState } from "react";
import {
  EditionMetadata,
  ResponseData,
  SurveyMetadata,
  Entity,
} from "@devographics/types";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";
import { getFormPaths } from "@devographics/templates";
import {
  getAllResponsesSelector,
  getResponsesSelector,
  getUnnormalizedResponsesSelector,
} from "~/lib/normalization/helpers/getSelectors";
import Dialog from "./Dialog";

const Metadata = ({
  survey,
  edition,
  question,
  responsesCount,
  responses,
  normalizedResponses,
  unnormalizedResponses,
  questionData,
  entities,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  responses: NormalizationResponse[];
  normalizedResponses: NormalizationResponse[];
  unnormalizedResponses: NormalizationResponse[];
  questionData: ResponseData;
  entities: Entity[];
}) => {
  const [showDbInfo, setShowDbInfo] = useState(false);

  if (!responses) return <p>Nothing to normalize</p>;

  const questionObject = getQuestionObject({
    survey,
    edition,
    section: question.section,
    question,
  })!;
  const formPaths = getFormPaths({ edition, question: questionObject });

  const rawSelector = getResponsesSelector({
    edition,
    questionObject,
  });
  const normSelector = getAllResponsesSelector({
    edition,
    questionObject,
  });

  return (
    <div>
      <a
        role="button"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowDbInfo(!showDbInfo);
        }}
      >
        Metadata
      </a>
      <Dialog
        showModal={showDbInfo}
        setShowModal={setShowDbInfo}
        header={
          <span>
            DB info for <code>{question.id}</code>
          </span>
        }
      >
        <div>
          <p>
            <ul>
              <li>
                Raw Path: <code>{formPaths?.other}</code>
              </li>
              <li>
                Selector: <textarea>{JSON.stringify(rawSelector)}</textarea>
              </li>
              <li>
                Normalized Path: <code>{questionObject?.normPaths?.other}</code>
              </li>
              <li>
                Selector: <textarea>{JSON.stringify(normSelector)}</textarea>
              </li>
            </ul>
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default Metadata;
