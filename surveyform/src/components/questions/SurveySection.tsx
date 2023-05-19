"use client";

import SurveySectionContents from "./SurveySectionContents";
import { EditionMetadata } from "@devographics/types";
import { useResponse } from "~/lib/responses/hooks";
import { Loading } from "~/components/ui/Loading";
import { ResponseError } from "~/components/error/ResponseError";

export const SurveySectionWithResponse = ({
  responseId,
}: {
  responseId: string;
  sectionNumber: number;
  edition: EditionMetadata;
}) => {
  const {
    response,
    loading: responseLoading,
    error: responseError,
  } = useResponse({ responseId });

  if (responseLoading) {
    return <Loading />;
  }

  console.log("// SurveySectionWithResponse");
  console.log(response);
  console.log(responseLoading);
  console.log(responseError);

  if (responseError) {
    return (
      <div>
        <ResponseError responseError={responseError} />
      </div>
    );
  }
  return <SurveySectionContents response={response} />;
};

export const SurveySectionReadOnly = () => {
  return <SurveySectionContents readOnly={true} />;
};
