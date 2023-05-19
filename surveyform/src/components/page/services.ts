import { apiRoutes } from "~/lib/apiRoutes";
import { EditionMetadata } from "@devographics/types";
export interface ErrorObject {
  id: string;
}
// TODO: POST calls are not using hooks per se
// they could benefit from a refactor after we write a few ones

// transform the graphql error to make it readable
// TODO: improve the backend to avoid this step
// @see start-survey endpoint for the rawError structure
const extractErrorObject = (rawError): ErrorObject | null => {
  if (!rawError) return null;
  try {
    const errorObject = JSON.parse(rawError.message);
    return errorObject[0]?.data?.errors[0];
  } catch (error) {
    return { id: "app.unknown_error" };
  }
};

export async function createResponse({ data }: { data: any }) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(apiRoutes.responses.createResponse.href(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result: { data: any; error: any } = await fetchRes.json();
  return result;
}

export async function saveResponse({
  responseId,
  data,
}: {
  responseId: string;
  data: any;
}) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(
    apiRoutes.responses.saveResponse.href({
      responseId,
    }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  const result: { data: any; error: any } = await fetchRes.json();
  return result;
}
