import type { ResponseDocument } from "@devographics/types";
import {
  // OptionMetadata,
  // DbPaths,
  QuestionMetadata,
} from "@devographics/types";
import { FormProps } from "./FormPropsContext";
// import { Message } from "./FormMessages";

export type FormInputProps<TValue = string | number | string[] | number[]> = {
  /**
   * 
   * NOTE: "path" may be undefined if the component template name (for instance "textList")
   * doesn't match an existing template in the API/shared code
   */
  path: string;
  value: TValue; // TODO: value might be undefined?
  question: QuestionMetadata;
  questionNumber: number;
  enableReadingList: boolean;
  updateCurrentValues: any
  /** @deprecated Get from context instead */
  response?: ResponseDocument
}
  // courtesy to avoid rewriting all input components
  & FormProps;
