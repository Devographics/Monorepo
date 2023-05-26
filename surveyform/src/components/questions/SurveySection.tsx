"use client";

import SurveySectionContents from "./SurveySectionContents";
import { EditionMetadata } from "@devographics/types";
import { Loading } from "~/components/ui/Loading";
import { ResponseError } from "~/components/error/ResponseError";
import { useResponse } from "../ResponseContext/ResponseProvider";

export const SurveySectionWithResponse = ({
  responseId,
}: {
  responseId: string;
  sectionNumber: number;
  edition: EditionMetadata;
}) => {
  const { response } = useResponse();

  /*
  if (responseError) {
    return (
      <div>
        <ResponseError responseError={responseError} />
      </div>
    );
  }*/
  return <SurveySectionContents response={response} />;
};

export const SurveySectionReadOnly = () => {
  return <SurveySectionContents readOnly={true} />;
};
