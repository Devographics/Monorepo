import SurveySectionContents from "./SurveySectionContents";
import { EditionMetadata, ResponseDocument } from "@devographics/types";

export const SurveySection = ({
  response,
}: {
  response: ResponseDocument;
  sectionNumber: number;
  edition: EditionMetadata;
}) => {
  return <SurveySectionContents response={response} />;
};

// show the user response in readonly mode
export const SurveySectionReadOnly = ({ response }) => {
  return <SurveySectionContents readOnly={true} response={response} />;
};

// just show the questions
export const SurveySectionOutline = () => {
  return <SurveySectionContents readOnly={true} />;
};
