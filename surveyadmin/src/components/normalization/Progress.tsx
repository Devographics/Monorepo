import { useState } from "react";
import { Segment, SegmentDone, defaultSegmentSize, statuses } from "./hooks";
import {
  normalizeEdition,
  normalizeQuestion,
} from "~/lib/normalization/services";
import {
  NormalizationResult,
  NormalizationSummary,
} from "./NormalizationResult";
import { useDidMountEffect } from "../hooks";
import { SegmentProps } from "./NormalizeQuestion";
import {
  EditionMetadata,
  SurveyMetadata,
  QuestionWithSection,
} from "@devographics/types";

const Loading = () => <span aria-busy={true} />;

interface ProgressProps extends SegmentProps {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  question?: QuestionWithSection;
  responsesCount: number;
}

/**
 * Progress is in charge of firing the requests for each segment
 * via an effect when displaying the segment item element
 * @param props
 * @returns
 */
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

  const isDone = doneCount >= responsesCount;

  return (
    <div className="normalization-progress">
      {responsesCount > 0 && (
        <div>
          <h5>Found {responsesCount} responses to normalize… </h5>
          {segmentsDone.map((s, i) => (
            <SegmentDoneItem
              {...props}
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
          {isDone && (
            <div>
              <p>Done</p>
              <hr />
            </div>
          )}
          {!isDone &&
            (enabled ? (
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
            ))}
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
  segments,
}: SegmentDone &
  ProgressProps & {
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
        segments={segments}
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
  segments,
}: Segment &
  ProgressProps & {
    onlyUnnormalized?: boolean;
    segmentIndex: number;
    responsesCount: number;
  }) => {
  useDidMountEffect(() => {
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
          currentSegmentIndex: segmentIndex + 1,
          totalSegments: segments.length,
        };
        // either run normalization for a single question, or for all questions in edition
        const result = question
          ? await normalizeQuestion({ ...args, questionId: question.id })
          : await normalizeEdition(args);

        const doneCount = startFrom + (result?.data?.totalDocumentCount || 0);
        updateSegments({
          doneCount,
          doneSegmentIndex: segmentIndex,
          doneSegmentData: result?.data!,
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
        segments={segments}
      />{" "}
      {enabled ? <Loading /> : <span>Paused</span>}
    </article>
  );
};

const SegmentData = ({
  index,
  inProgress,
  startFrom,
  responsesCount,
  segments,
}: {
  index: number;
  inProgress: boolean;
  startFrom: number;
  responsesCount: number;
  segments: Segment[];
}) => {
  return (
    <p>
      <strong>
        Segment {index}/{segments.length}
      </strong>{" "}
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
