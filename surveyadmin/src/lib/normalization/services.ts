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

export type ResultsPayload = {
  data?: NormalizeInBulkResult;
  error: any;
};

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
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
  return result;
}

export interface RenameTokensParams {
  tokens: Array<{ from: string; to: string }>;
}

export async function renameTokens(params: RenameTokensParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.renameTokens.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: ResultsPayload = await fetchRes.json();
  return result;
}

export interface DeleteTokensParams {
  editionId: string;
  tokens: Array<string>;
}

export async function deleteTokens(params: DeleteTokensParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.deleteTokens.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: ResultsPayload = await fetchRes.json();
  return result;
}

export interface ApproveTokensParams {
  tokens: Array<{
    normalizationId: string;
    id: string;
    renameTo: string;
    shouldDismiss?: boolean;
  }>;
}

export async function approveTokens(params: ApproveTokensParams) {
  const fetchRes = await fetch(
    apiRoutes.normalization.approveTokens.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
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
  const result: ResultsPayload = await fetchRes.json();
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

export async function importNormalizationsCSV(params: ImportNormalizationArgs) {
  const fetchRes = await fetch(
    apiRoutes.normalization.importNormalizationsCSV.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: ResultsPayload = await fetchRes.json();
  return result;
}

export async function importNormalizationsJSON(
  params: ImportNormalizationArgs
) {
  const fetchRes = await fetch(
    apiRoutes.normalization.importNormalizationsJSON.href(params),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  const result: ResultsPayload = await fetchRes.json();
  return result;
}
