"use client";

import Progress from "~/components/normalization/Progress";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { defaultSegmentSize, useSegments } from "./hooks";

export const NormalizeEdition = ({
  survey,
  edition,
  responsesCount,
  normResponsesCount,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  responsesCount: number;
  normResponsesCount: number;
}) => {
  const isFirstNormalization = normResponsesCount === 0;
  const {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  } = useSegments();

  const props = {
    responsesCount,
    survey,
    edition,
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
    isFirstNormalization,
  };

  return (
    <div className="admin-normalization admin-content">
      <h4>Normalize Edition</h4>

      <button
        onClick={() => {
          initializeSegments({
            responsesCount,
            segmentSize: defaultSegmentSize,
          });
        }}
      >
        Normalize {edition.id} ({responsesCount} responses)
      </button>
      {segments.length > 0 && <Progress {...props} />}
    </div>
  );
};

export default NormalizeEdition;
