import type { ResponseDocument } from "@devographics/types";
import {
  SurveyMetadata,
  EditionMetadata,
  // OptionMetadata,
  // DbPaths,
  SectionMetadata,
  QuestionMetadata,
} from "@devographics/types";
// import { Message } from "./FormMessages";

export type FormInputProps<TValue = string | number | string[] | number[]> = {
  /**
   * NOTE: in read-only mode there might be no response
   * All form inputs have to be robust to this scenario
   */
  response?: ResponseDocument;
  /**
   * 
   * NOTE: "path" may be undefined if the component template name (for instance "textList")
   * doesn't match an existing template in the API/shared code
   */
  path: string;
  value: TValue; // TODO: value might be undefined?
  survey: SurveyMetadata;
  edition: EditionMetadata;
  section: SectionMetadata;
  question: QuestionMetadata;
  updateCurrentValues: any;
  submitForm: any;
  readOnly?: boolean;
  stateStuff: any;
  sectionNumber: number;
  questionNumber: number;
  enableReadingList: boolean;
};
