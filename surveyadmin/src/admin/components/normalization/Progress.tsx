import React, { useEffect } from "react";
import { gql, useMutation } from "@apollo/client";
import { useVulcanComponents } from "@vulcanjs/react-ui";

const segmentSize = 200;

const statuses = { scheduled: 0, inProgress: 1, done: 2 };

const getSegmentStatus = (doneCount, i) => {
  const startFrom = i * segmentSize;
  if (startFrom < doneCount) {
    return statuses.done;
  } else if (startFrom === doneCount) {
    return statuses.inProgress;
  } else {
    return statuses.scheduled;
  }
};

const Progress = ({
  survey,
  responsesCount,
  doneCount,
  enabled,
  setEnabled,
  setDoneCount,
  fieldId,
  refetchMissingFields,
  onlyUnnormalized,
  isAllFields,
}) => {
  const segments = [...Array(Math.ceil(responsesCount / segmentSize))].map(
    (x, i) => ({
      i,
      startFrom: i * segmentSize,
      status: getSegmentStatus(doneCount, i),
    })
  );

  const segmentInProgress = segments.find(
    (s) => s.status === statuses.inProgress
  );

  const segmentsDone = segments.filter((s) => s.status === statuses.done);

  useEffect(() => {
    if (doneCount === responsesCount) {
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
              segmentIndex={segmentsDone.length}
              surveyId={survey.slug}
              startFrom={segmentInProgress?.startFrom}
              responsesCount={responsesCount}
              setDoneCount={setDoneCount}
              enabled={enabled}
              fieldId={fieldId}
              onlyUnnormalized={onlyUnnormalized}
              isAllFields={isAllFields}
            />
          )}
          {doneCount === responsesCount && <div>Done</div>}
        </div>
      )}
    </div>
  );
};

const SegmentDone = ({ startFrom, responsesCount }) => (
  <div>
    {startFrom}/{responsesCount} done
  </div>
);

const normalizeSurveyMutation = gql`
  mutation normalizeSurvey(
    $surveyId: String
    $fieldId: String
    $startFrom: Int
    $limit: Int
    $onlyUnnormalized: Boolean
  ) {
    normalizeSurvey(
      surveyId: $surveyId
      fieldId: $fieldId
      startFrom: $startFrom
      limit: $limit
      onlyUnnormalized: $onlyUnnormalized
    )
  }
`;

const SegmentInProgress = ({
  surveyId,
  fieldId,
  segmentIndex,
  startFrom,
  responsesCount,
  setDoneCount,
  enabled,
  onlyUnnormalized,
  isAllFields,
}) => {
  const Components = useVulcanComponents();

  const [mutateFunction, { data, loading, error }] = useMutation(
    normalizeSurveyMutation,
    {
      onCompleted: (data) => {
        setDoneCount(startFrom + data?.normalizeSurvey?.count);
      },
    }
  );

  useEffect(() => {
    if (enabled) {
      /*

      When only normalizing unnormalized results, we'll first get a fresh list of all unnormalized
      IDs at every iteration, so we don't need to offset them using startFrom

      */
      mutateFunction({
        variables: {
          surveyId,
          fieldId: isAllFields ? null : fieldId,
          startFrom: onlyUnnormalized ? 0 : startFrom,
          limit: segmentSize,
          onlyUnnormalized,
        },
      });
    }
  }, [segmentIndex, enabled]);

  return (
    <div>
      Normalizing {startFrom}/{responsesCount} responses…{" "}
      {enabled ? <Components.Loading /> : <span>Paused</span>}
    </div>
  );
};

export default Progress;
