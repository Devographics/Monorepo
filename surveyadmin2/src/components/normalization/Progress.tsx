import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Segment, SegmentDone, defaultSegmentSize, statuses } from "./hooks";
import {
  normalizeEdition,
  normalizeQuestion,
} from "~/lib/normalization/services";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import {
  EditionMetadata,
  QuestionMetadata,
  SurveyMetadata,
} from "@devographics/types";
import {
  NormalizationResult,
  NormalizationSummary,
} from "./NormalizationResult";

const Loading = () => <span aria-busy={true} />;

interface ProgressProps {
  responsesCount: number;
  doneCount: number;
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  segments: Segment[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question?: QuestionMetadata;
  onlyUnnormalized?: boolean;
  updateSegments: any;
}

const Progress = (props: ProgressProps) => {
  const { responsesCount, doneCount, enabled, setEnabled, segments } = props;
  const segmentInProgress = segments.find(
    (s) => s.status === statuses.inProgress
  );

  const segmentsDone = segments.filter(
    (s) => s.status === statuses.done
  ) as SegmentDone[];

  // useEffect(() => {
  //   if (doneCount >= responsesCount) {
  //     refetchMissingFields();
  //   }
  // }, [doneCount, responsesCount]);

  return (
    <div className="normalization-progress">
      {responsesCount > 0 && (
        <div>
          <h3>Found {responsesCount} responses to normalize… </h3>
          {segmentsDone.map((s, i) => (
            <SegmentDoneItem
              key={i}
              segmentIndex={i}
              {...s}
              responsesCount={responsesCount}
            />
          ))}
          {segmentInProgress && (
            <SegmentInProgressItem
              {...props}
              {...segmentInProgress}
              segmentIndex={segmentsDone.length}
              startFrom={segmentInProgress?.startFrom}
            />
          )}
          {doneCount >= responsesCount && <div>Done</div>}
          {enabled ? (
            <button
              onClick={() => {
                setEnabled(false);
              }}
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => {
                setEnabled(true);
              }}
            >
              Restart
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const SegmentDoneItem = ({
  startFrom,
  responsesCount,
  data,
  segmentIndex,
}: SegmentDone & {
  responsesCount: number;
  segmentIndex: number;
}) => {
  const [showResults, setShowResults] = useState(false);
  const { duration, discardedCount, errorCount, normalizedDocuments } = data;
  return (
    <article>
      <SegmentData
        index={segmentIndex + 1}
        inProgress={false}
        startFrom={startFrom}
        responsesCount={responsesCount}
      />
      <NormalizationSummary {...data} />

      <a
        href="#"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          setShowResults(!showResults);
        }}
      >
        {showResults ? "Hide Results" : "Show Results"}
      </a>
      {showResults && <NormalizationResult {...data} showSummary={false} />}
    </article>
  );
};

const SegmentInProgressItem = ({
  survey,
  edition,
  question,
  segmentIndex,
  startFrom,
  responsesCount,
  enabled,
  onlyUnnormalized,
  updateSegments,
}: Segment &
  ProgressProps & {
    segmentIndex: number;
    responsesCount: number;
  }) => {
  useEffect(() => {
    if (enabled) {
      /*

      When only normalizing unnormalized results, we'll first get a fresh list of all unnormalized
      IDs at every iteration, so we don't need to offset them using startFrom

      */
      const fetchData = async () => {
        const args = {
          surveyId: survey.id,
          editionId: edition.id,
          startFrom: onlyUnnormalized ? 0 : startFrom,
          limit: defaultSegmentSize,
          onlyUnnormalized,
        };
        // either run normalization for a single question, or for all questions in edition
        const result = question
          ? await normalizeQuestion({ ...args, questionId: question.id })
          : await normalizeEdition(args);

        const doneCount = startFrom + (result?.data?.totalDocumentCount || 0);
        updateSegments({
          doneCount,
          doneSegmentIndex: segmentIndex,
          doneSegmentData: result?.data,
          segmentSize: defaultSegmentSize,
        });
      };
      fetchData().catch(console.error);
    }
  }, [segmentIndex, enabled]);

  return (
    <article>
      <SegmentData
        index={segmentIndex + 1}
        inProgress={true}
        startFrom={startFrom}
        responsesCount={responsesCount}
      />{" "}
      {enabled ? <Loading /> : <span>Paused</span>}
    </article>
  );
};

const SegmentData = ({ index, inProgress, startFrom, responsesCount }) => {
  return (
    <p>
      <strong>Segment {index} / </strong>
      <span>
        {inProgress ? "Normalizing" : "Normalized"} <strong>{startFrom}</strong>
        -
        <strong>
          {Math.min(responsesCount, startFrom + defaultSegmentSize)}
        </strong>{" "}
        out of <strong>{responsesCount}</strong> responses
      </span>
    </p>
  );
};

export default Progress;
