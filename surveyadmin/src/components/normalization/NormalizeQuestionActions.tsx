"use client";
import { defaultSegmentSize } from "./hooks";
import Metadata from "./Metadata";
import { CommonNormalizationProps, SegmentProps } from "./NormalizeQuestion";
import { Import } from "./ImportJSON";
import { ViewQuestionData } from "./QuestionData";
import { Export } from "./Export";
import { ActionLog } from "./ActionLog";
import { WordFrequencies } from "./WordFrequencies";
import { RenameTokens } from "./RenameTokens";
import { SuggestedTokens } from "./SuggestedTokens";
import TokensTrigger, { TokensTriggerLink } from "./Tokens";
import { AiTokensTrigger } from "./AiTokens";
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
        <Export {...props} />
        <Import {...props} />
        <ActionLog {...props} />
        <WordFrequencies {...props} />
        <RenameTokens {...props} />
        <SuggestedTokens {...props} />
        <AiTokensTrigger {...props} />
        <TokensTriggerLink {...props} />
      </div>
    </div>
  );
};

export default Actions;
