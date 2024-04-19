"use client";

import Progress from "~/components/normalization/Progress";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { defaultSegmentSize, useSegments } from "./hooks";
import { CommonNormalizationProps } from "./NormalizeQuestion";

export const NormalizeEdition = ({
  survey,
  edition,
  responsesCount,
  normResponsesCount,
  addToActionLog,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
  responsesCount: number;
  normResponsesCount: number;
  addToActionLog: CommonNormalizationProps["addToActionLog"];
}) => {
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
    addToActionLog,
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
