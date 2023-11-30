import { apiRoutes } from "~/lib/apiRoutes";
import {
  AddManualNormalizationArgs,
  NormalizeEditionArgs,
  NormalizeQuestionArgs,
  NormalizeQuestionResponsesArgs,
  NormalizeResponsesArgs,
  LoadNormalizationPercentagesArgs,
  NormalizationProgressStats,
} from "./actions";
import { NormalizeInBulkResult } from "./types";
import { GetQuestionDataArgs } from "./actions/getQuestionData";

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
  const result: { data?: NormalizeInBulkResult; error: any } =
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
  const result: { data?: NormalizeInBulkResult; error: any } =
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
  const result: { data?: NormalizeInBulkResult; error: any } =
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
  const result: { data?: NormalizeInBulkResult; error: any } =
    await fetchRes.json();
  return result;
}

export async function addManualNormalizations(
  params: AddManualNormalizationArgs
) {
  const fetchRes = await fetch(
    apiRoutes.normalization.addManualNormalizations.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizeInBulkResult; error: any } =
    await fetchRes.json();
  return result;
}

export async function loadNormalizationPercentages(
  params: LoadNormalizationPercentagesArgs
) {
  const fetchRes = await fetch(
    apiRoutes.normalization.loadNormalizationPercentages.href(params),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizationProgressStats; error: any } =
    await fetchRes.json();
  return result;
}

export async function loadQuestionData(params: GetQuestionDataArgs) {
  const fetchRes = await fetch(
    apiRoutes.normalization.loadQuestionData.href(params),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify(params),
    }
  );
  const result: { data?: NormalizationProgressStats; error: any } =
    await fetchRes.json();
  return result;
}
