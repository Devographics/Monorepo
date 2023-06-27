import { apiRoutes } from "~/lib/apiRoutes";
import {
  NormalizeEditionArgs,
  NormalizeQuestionArgs,
  NormalizeQuestionResponsesArgs,
  NormalizeResponsesArgs,
} from "./actions";
import { NormalizeSurveyResult } from "./actions/normalizeInBulk";

// export async function loadFields({ surveyId, editionId, questionId }) {
//   const fetchRes = await fetch(
//     apiRoutes.normalization.loadFields.href({
//       surveyId,
//       editionId,
//       questionId,
//     }),
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       // body: JSON.stringify({ editionId, questionId }),
//     }
//   );
//   const result: { data?: any; error: any } = await fetchRes.json();
//   return result;
// }

export async function normalizeResponses(params: NormalizeResponsesArgs) {
  const fetchRes = await fetch(
    apiRoutes.normalization.normalizeResponses.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizeSurveyResult; error: any } =
    await fetchRes.json();
  return result;
}

export async function normalizeQuestionResponses(
  params: NormalizeQuestionResponsesArgs
) {
  const fetchRes = await fetch(
    apiRoutes.normalization.normalizeQuestionResponses.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizeSurveyResult; error: any } =
    await fetchRes.json();
  return result;
}

export async function normalizeQuestion(params: NormalizeQuestionArgs) {
  const fetchRes = await fetch(
    apiRoutes.normalization.normalizeQuestion.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizeSurveyResult; error: any } =
    await fetchRes.json();
  return result;
}

export async function normalizeEdition(params: NormalizeEditionArgs) {
  const fetchRes = await fetch(
    apiRoutes.normalization.normalizeEdition.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizeSurveyResult; error: any } =
    await fetchRes.json();
  return result;
}
