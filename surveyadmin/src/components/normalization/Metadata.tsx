"use client";
import { useState } from "react";
import {
  EditionMetadata,
  ResponseData,
  SurveyMetadata,
} from "@devographics/types";
import { NormalizationResponse } from "~/lib/normalization/hooks";
import { getQuestionObject } from "~/lib/normalization/helpers/getQuestionObject";
import type { QuestionWithSection } from "~/lib/normalization/types";
import { getFormPaths } from "@devographics/templates";
import {
  getResponsesSelector,
  getUnnormalizedResponsesSelector,
} from "~/lib/normalization/helpers/getSelectors";

const Metadata = ({
  survey,
  edition,
  question,
  responsesCount,
  responses,
  questionData,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionWithSection;
  responsesCount: number;
  responses: NormalizationResponse[];
  questionData: ResponseData;
}) => {
  const [showIds, setShowIds] = useState(true);
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
  const normSelector = getUnnormalizedResponsesSelector({
    edition,
    questionObject,
  });

  return (
    <div>
      <p>
        <strong>{responses.length}</strong> missing normalizations out of{" "}
        <strong>{responsesCount}</strong> total responses for{" "}
        <code>
          {edition.id}/{question.id}
        </code>
        .
      </p>
      <p>
        <a
          role="button"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowDbInfo(!showDbInfo);
          }}
        >
          {showDbInfo ? "Hide" : "Show"} DB Info
        </a>
        {showDbInfo && (
          <article>
            <p>
              <ul>
                <li>
                  Raw Path: <code>{formPaths?.other}</code>
                </li>
                <li>
                  Selector: <textarea>{JSON.stringify(rawSelector)}</textarea>
                </li>
                <li>
                  Normalized Path:{" "}
                  <code>{questionObject?.normPaths?.other}</code>
                </li>
                <li>
                  Selector: <textarea>{JSON.stringify(normSelector)}</textarea>
                </li>
              </ul>
            </p>
          </article>
        )}
      </p>
      <p>
        Match Tags:{" "}
        <span>
          <code>{question.id} [id]</code>{" "}
        </span>
        {question.matchTags?.map((tag) => (
          <span key={tag}>
            <code>{tag}</code>{" "}
          </span>
        ))}
      </p>
      <p>
        <input
          type="checkbox"
          checked={showIds}
          onClick={() => {
            setShowIds(!showIds);
          }}
        />{" "}
        Show IDs
      </p>
    </div>
  );
};

export default Metadata;
