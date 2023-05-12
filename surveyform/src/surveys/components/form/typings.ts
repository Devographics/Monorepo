import { ResponseDocument } from "@devographics/core-models";
import {
  SurveyMetadata,
  EditionMetadata,
  OptionMetadata,
  DbPaths,
  SectionMetadata,
} from "@devographics/types";
import { QuestionFormTemplateOutput } from "~/surveys/parser/addTemplateToSurvey";

export interface QuestionFormObject extends QuestionFormTemplateOutput {
  type: NumberConstructor | StringConstructor;
  formPaths: DbPaths;
}

export type FormInputProps = {
  response: ResponseDocument;
  path: string;
  value: string | number;
  survey: SurveyMetadata;
  edition: EditionMetadata;
  section: SectionMetadata;
  question: QuestionFormObject;
  updateCurrentValues: any;
  submitForm: any;
  isFirstQuestion?: boolean;
  readOnly?: boolean;
  stateStuff: any;
};
