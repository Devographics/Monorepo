import { apiRoutes } from "~/lib/apiRoutes";
import { SurveyEdition } from "@devographics/core-models";
// import { getSurveyContextId } from "~/surveys/parser/parseSurvey";
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

export async function startEdition({
  edition,
  data,
}: {
  edition: EditionMetadata;
  data: any;
}) {
  const { id: editionId, surveyId } = edition;
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(
    apiRoutes.response.startSurvey.href({
      surveyId,
      editionId,
    }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!fetchRes.ok) {
    console.error(await fetchRes.text());
    throw new Error("Could not start survey, request failed");
  }
  // data/errors is typical of graphql endpoints
  const res: { data?: any; errors?: Array<any> } = await fetchRes.json();
  const errorObject = extractErrorObject(res?.errors?.[0]);
  return { data: res.data, error: errorObject };
}

export async function saveSurvey(edition: EditionMetadata, data: any) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(
    apiRoutes.response.saveSurvey.href({
      surveyId: edition.surveyId,
      editionId: edition.id!,
    }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );
  if (!fetchRes.ok) {
    console.error(await fetchRes.text());

    throw new Error("Could not start survey, request failed");
  }
  // data/errors is typical of graphql endpoints
  const res: { data?: any; errors?: Array<any> } = await fetchRes.json();
  const errorObject = extractErrorObject(res?.errors?.[0]);
  return { data: res.data, error: errorObject };
}
