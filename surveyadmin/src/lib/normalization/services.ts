import { apiRoutes } from "~/lib/apiRoutes";
import {
  NormalizeEditionArgs,
  NormalizeQuestionArgs,
  NormalizeQuestionResponsesArgs,
  NormalizeResponsesArgs,
  LoadNormalizationPercentagesArgs,
  NormalizationProgressStats,
  ImportNormalizationArgs,
} from "./actions";
import { NormalizeInBulkResult } from "./types";
import { GetQuestionDataArgs } from "./actions/getQuestionData";
import { CustomNormalizationParams } from "@devographics/types";

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

export async function addCustomTokens(params: CustomNormalizationParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.addCustomTokens.href(params),
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

export async function removeCustomTokens(params: CustomNormalizationParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.removeCustomTokens.href(params),
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
export async function enableRegularTokens(params: CustomNormalizationParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.enableRegularTokens.href(params),
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

export async function disableRegularTokens(params: CustomNormalizationParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.disableRegularTokens.href(params),
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

export async function importNormalizations(params: ImportNormalizationArgs) {
  const fetchRes = await fetch(
    apiRoutes.normalization.importNormalizations.href(params),
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
