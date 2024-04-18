"use client";
import { defaultSegmentSize } from "./hooks";
import Metadata from "./Metadata";
import Tokens from "./Tokens";
import { CommonNormalizationProps, SegmentProps } from "./NormalizeQuestion";
import { Import } from "./Import";
import { ViewQuestionData } from "./QuestionData";
import { Random } from "./Random";
import { ActionLog } from "./ActionLog";
import { WordFrequencies } from "./WordFrequencies";
import { RenameTokens } from "./RenameTokens";
// import Dropdown from "~/core/components/ui/Dropdown";

export const allFields = { id: "all_fields", label: "All Fields" };

export type ActionProps = CommonNormalizationProps & SegmentProps;

const Actions = (props: ActionProps) => {
  const {
    survey,
    edition,
    question,
    initializeSegments,
    responses,
    responsesCount,
  } = props;
  return (
    <div className="normalization-actions">
      <div className="primary">
        <ViewQuestionData {...props} />
        <Metadata {...props} />
        {/* <Tokens {...props} /> */}
        <Import {...props} />
        <Random {...props} />
        <ActionLog {...props} />
        <WordFrequencies {...props} />
        <RenameTokens {...props} />
      </div>
      <div
        className="secondary"
        data-tooltip="Re-run normalization on all answers"
      >
        <a
          onClick={() => {
            initializeSegments({
              responsesCount,
              segmentSize: defaultSegmentSize,
            });
          }}
        >
          🔄 Normalize All
        </a>
      </div>
    </div>
  );
};

export default Actions;
