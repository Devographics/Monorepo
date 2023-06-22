import React, { useEffect } from "react";
import { statuses } from "./Normalization";

const Loading = () => <span>⌛</span>;

const Progress = (props) => {
  const {
    responsesCount,
    doneCount,
    enabled,
    setEnabled,
    refetchMissingFields,
    segments,
  } = props;
  const segmentInProgress = segments.find(
    (s) => s.status === statuses.inProgress
  );

  const segmentsDone = segments.filter((s) => s.status === statuses.done);

  useEffect(() => {
    if (doneCount >= responsesCount) {
      refetchMissingFields();
    }
  }, [doneCount, responsesCount]);

  return (
    <div className="normalization-progress">
      {responsesCount > 0 && (
        <div>
          <h3>
            Found {responsesCount} responses to normalize…{" "}
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
          </h3>
          {segmentsDone.map((s, i) => (
            <SegmentDone key={i} {...s} responsesCount={responsesCount} />
          ))}
          {segmentInProgress && (
            <SegmentInProgress
              {...props}
              segmentIndex={segmentsDone.length}
              startFrom={segmentInProgress?.startFrom}
            />
          )}
          {doneCount >= responsesCount && <div>Done</div>}
        </div>
      )}
    </div>
  );
};

const SegmentDone = ({ startFrom, responsesCount, data }) => {
  const { duration, discardedCount, errorCount } = data;
  return (
    <div>
      {startFrom}/{responsesCount} done in {duration}s ({errorCount} errors,{" "}
      {discardedCount} responses discarded)
    </div>
  );
};

const SegmentInProgress = ({
  edition,
  questionId,
  segmentIndex,
  startFrom,
  responsesCount,
  enabled,
  onlyUnnormalized,
  isAllFields,
  updateSegments,
  segmentSize,
}) => {
  const editionId = edition.id;

  const mutateFunction = () => {};

  useEffect(() => {
    if (enabled) {
      /*

      When only normalizing unnormalized results, we'll first get a fresh list of all unnormalized
      IDs at every iteration, so we don't need to offset them using startFrom

      */
      mutateFunction({
        editionId,
        questionId: isAllFields ? null : questionId,
        startFrom: onlyUnnormalized ? 0 : startFrom,
        limit: segmentSize,
        onlyUnnormalized,
      }).then((data) => {
        const doneCount = startFrom + data?.normalizeResponses?.count;
        updateSegments({
          doneCount,
          doneSegmentIndex: segmentIndex,
          doneSegmentData: data?.normalizeResponses,
          segmentSize,
        });
      });
    }
  }, [segmentIndex, enabled]);

  return (
    <div>
      Normalizing {startFrom}/{responsesCount} responses…{" "}
      {enabled ? <Loading /> : <span>Paused</span>}
    </div>
  );
};

export default Progress;
