import type { ResponseDocument } from "@devographics/types";
import {
  SurveyMetadata,
  EditionMetadata,
  OptionMetadata,
  DbPaths,
  SectionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { Message } from "./FormMessages";

export type FormInputProps = {
  /**
   * NOTE: in read-only mode there might be no response
   * All form inputs have to be robust to this scenario
   */
  response?: ResponseDocument;
  path: string;
  value: string | number | string[] | number[];
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
};
