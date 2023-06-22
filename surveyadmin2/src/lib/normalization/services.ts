import { apiRoutes } from "~/lib/apiRoutes";

export async function loadFields({ editionId, questionId }) {
  const fetchRes = await fetch(apiRoutes.normalization.loadFields.href(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ editionId, questionId }),
  });
  const result: { data?: any; error: any } = await fetchRes.json();
  return result;
}
