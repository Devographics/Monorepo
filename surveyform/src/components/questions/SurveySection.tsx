"use client";
// TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
// until this bug is fixed it has to stay a client component
import SurveySectionContents from "./SurveySectionContents";
import { useResponse } from "../ResponseContext/ResponseProvider";

export const SurveySection = ({ }: //response,
  {
    // response: ResponseDocument;
    // sectionNumber: number;
    // edition: EditionMetadata;
  }) => {
  // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
  const { response } = useResponse();
  return <SurveySectionContents response={response} />;
};

// show the user response in readonly mode
export const SurveySectionReadOnly = (/*{ response }*/) => {
  // TODO: @see https://github.com/vercel/next.js/issues/49387#issuecomment-1564539515
  const { response } = useResponse();
  return <SurveySectionContents readOnly={true} response={response} />;
};
