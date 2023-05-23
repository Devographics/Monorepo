import type { ResponseDocument } from "@devographics/types";
import {
  SurveyMetadata,
  EditionMetadata,
  OptionMetadata,
  DbPaths,
  SectionMetadata,
  QuestionMetadata,
} from "@devographics/types";

export type FormInputProps = {
  response: ResponseDocument;
  path: string;
  value: string | number | string[] | number[];
  survey: SurveyMetadata;
  edition: EditionMetadata;
  section: SectionMetadata;
  question: QuestionMetadata;
  updateCurrentValues: any;
  submitForm: any;
  isFirstQuestion?: boolean;
  readOnly?: boolean;
  stateStuff: any;
  sectionNumber: number;
  questionNumber: number;
};
