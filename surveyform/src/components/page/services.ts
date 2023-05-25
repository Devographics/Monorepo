import { apiRoutes } from "~/lib/apiRoutes";

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

export async function sendReadingList({
  responseId,
  editionId,
  surveyId,
  email,
}: {
  responseId: string;
  editionId: string;
  surveyId: string;
  email: string;
}) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(
    apiRoutes.responses.sendReadingList.href({
      responseId,
    }),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, editionId, surveyId }),
    }
  );
  const result: { data: any; error: any } = await fetchRes.json();
  return result;
}
