"use client";
import SurveySectionContents from "./SurveySectionContents";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { useResponse } from "../ResponseContext/ResponseProvider";

export const SurveySection = ({}: //response,
{
  response: ResponseDocument;
  sectionNumber: number;
  edition: EditionMetadata;
}) => {
  // TODO: somehow it doesn't update properly when the response is passed by the RSC
  const { response } = useResponse();
  return <SurveySectionContents response={response} />;
};

// show the user response in readonly mode
export const SurveySectionReadOnly = (/*{ response }*/) => {
  // TODO: somehow it doesn't update properly when the response is passed by the RSC
  const { response } = useResponse();
  return <SurveySectionContents readOnly={true} response={response} />;
};
