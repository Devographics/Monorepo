"use client";
import { useState } from "react";
import Options from "./Options";
import {
  normalizeQuestionResponses,
  normalizeResponses,
} from "~/lib/normalization/services";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { NormalizationResult } from "./NormalizationResult";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import { UnnormalizedResponses } from "~/lib/normalization/hooks";
import { InitializeSegmentsOptions, defaultSegmentSize } from "./hooks";
// import Dropdown from "~/core/components/ui/Dropdown";

export const allFields = { id: "all_fields", label: "All Fields" };

interface ActionProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question: QuestionMetadata;
  initializeSegments: (options: InitializeSegmentsOptions) => void;
  unnormalizedResponses: UnnormalizedResponses[];
  responsesCount: number;
}

const Actions = (props: ActionProps) => {
  const {
    survey,
    edition,
    question,
    initializeSegments,
    unnormalizedResponses,
    responsesCount,
  } = props;
  // const router = useRouter();

  const [normalizeMissingResult, setNormalizeMissingResult] =
    useState<NormalizeInBulkResult>();

  return (
    <>
      <article className="normalization-actions">
        <div className="primary">
          {/* <select
          onChange={() => {
            // build search string to update the browser URL query string
            // const search = qs.stringify({
            //   editionId: edition.id,
            //   questionId,
            // });
            // const newUrl = new URL(window.location.href);
            // newUrl.search = search;
            // router.push(newUrl);
            // setEditionId(edition.id);
          }}
        >
          {allEditions.map((edition) => (
            <option key={edition.id}>{edition.id}</option>
          ))}
        </select>{" "}
        &gt;{" "}
        <select
          onChange={() => {
            // build search string to update the browser URL query string
            // const search = qs.stringify({
            //   editionId,
            //   questionId: question.id,
            // });
            // const newUrl = new URL(window.location.href);
            // newUrl.search = search;
            // router.push(newUrl);
            // setQuestionId(question.id);
          }}
        >
          {questions.map((question) => (
            <option key={question.id}>{question.id}</option>
          ))}
        </select>{" "}
        &gt;{" "} */}
          {/* <Options {...props} /> */}

          <LoadingButton
            action={async () => {
              const result = await normalizeQuestionResponses({
                surveyId: survey.id,
                editionId: edition.id,
                questionId: question.id,
                responsesIds: unnormalizedResponses.map((r) => r.responseId),
              });
              setNormalizeMissingResult(result.data);
              console.log(result);
            }}
            label="Normalize Only Missing Values"
          />

          <button
            onClick={() => {
              initializeSegments({
                responsesCount,
                segmentSize: defaultSegmentSize,
              });
            }}
          >
            Normalize All
          </button>
        </div>
        {/* <div className="secondary">
        <button
          onClick={async () => {
            const idsString = prompt("Enter comma-separated ids") || "";
            const responsesIds = idsString.split(",");
            const result = await normalizeResponses({
              surveyId,
              responsesIds,
            });
            console.log(result);
            alert("Responses normalized");
          }}
        >
          Renormalize Responses
        </button>
      </div> */}
      </article>

      {normalizeMissingResult && (
        <article>
          <NormalizationResult
            {...normalizeMissingResult}
            showQuestionId={false}
          />
        </article>
      )}
    </>
  );
};

export const LoadingButton = ({ action, label }) => {
  const [loading, setLoading] = useState(false);
  return (
    <button
      aria-busy={loading}
      onClick={async () => {
        setLoading(true);
        await action();
        setLoading(false);
      }}
    >
      {label}
    </button>
  );
};

export default Actions;
