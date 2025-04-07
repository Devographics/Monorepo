"use client";

import { CommonNormalizationProps, SegmentProps } from "./NormalizeQuestion";
import { defaultSegmentSize } from "./hooks";

export const NormalizeAll = (
  props: CommonNormalizationProps & SegmentProps
) => {
  const { initializeSegments, responsesCount } = props;
  return (
    <button
      data-tooltip="Re-run normalization on all answers"
      onClick={() => {
        initializeSegments({
          responsesCount,
          segmentSize: defaultSegmentSize,
        });
      }}
    >
      🔄 Normalize All
    </button>
  );
};
