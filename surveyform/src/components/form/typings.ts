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
