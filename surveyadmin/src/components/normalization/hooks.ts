import { EditionMetadata, QuestionMetadata } from "@devographics/types";
import { useState } from "react";
import { NormalizeInBulkResult } from "~/lib/normalization/types";
import { useLocalStorage } from "@uidotdev/usehooks";

export const defaultSegmentSize = 1000;

export const statuses = { scheduled: 0, inProgress: 1, done: 2 };

export const getSegmentStatus = ({ doneCount, i, segmentSize }) => {
  const startFrom = i * segmentSize;
  if (startFrom < doneCount) {
    return statuses.done;
  } else if (startFrom === doneCount) {
    return statuses.inProgress;
  } else {
    return statuses.scheduled;
  }
};

export interface Segment {
  i: number;
  startFrom: number;
  status: number;
}

export interface SegmentDone extends Segment {
  data: NormalizeInBulkResult;
}

/**
 * Split the responses into chunks for processing
 */
export const getSegments = ({ responsesCount, segmentSize }): Segment[] => {
  const segments = [...Array(Math.ceil(responsesCount / segmentSize))].map(
    (x, i) => ({
      i,
      startFrom: i * segmentSize,
      status: getSegmentStatus({ doneCount: 0, i, segmentSize }),
    })
  );
  return segments;
};

export interface InitializeSegmentsOptions {
  responsesCount: number;
  segmentSize: number;
}

export const useSegments = () => {
  const [doneCount, setDoneCount] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const emptySegments: Segment[] = [];
  const [segments, setSegments] = useState(emptySegments);

  const initializeSegments = (options: InitializeSegmentsOptions) => {
    const { responsesCount, segmentSize } = options;
    const segments = getSegments({ responsesCount, segmentSize });
    // setResponsesCount(responsesCount);
    setSegments(segments);
  };

  const updateSegments = ({
    doneCount,
    doneSegmentIndex,
    doneSegmentData,
    segmentSize,
  }: {
    doneCount: number;
    doneSegmentIndex: number;
    doneSegmentData: NormalizeInBulkResult;
    segmentSize: number;
  }) => {
    setDoneCount(doneCount);
    setSegments((oldSegments) => {
      const newSegments = oldSegments.map((s, i) => ({
        ...s,
        status: getSegmentStatus({ doneCount, i, segmentSize }),
        ...(doneSegmentIndex === i ? { data: doneSegmentData } : {}),
      }));
      return newSegments;
    });
  };
  return {
    initializeSegments,
    updateSegments,
    doneCount,
    enabled,
    setEnabled,
    segments,
  };
};

const getCacheKey = (edition, question) =>
  `normalization_presets__${edition.id}__${question.id}`;

export const usePresets = ({
  edition,
  question,
}: {
  edition: EditionMetadata;
  question: QuestionMetadata;
}) => {
  const cacheKey = getCacheKey(edition, question);

  const [customPresets, setCustomPresets] = useLocalStorage<string[]>(
    cacheKey + "__custom",
    []
  );
  const [enabledPresets, setEnabledPresets] = useLocalStorage<string[]>(
    cacheKey + "__enabled",
    []
  );

  return {
    enabledPresets,
    setEnabledPresets,
    customPresets,
    setCustomPresets,
  };
};
