import { apiRoutes } from "~/lib/apiRoutes";

export async function loadScripts() {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(apiRoutes.scripts.loadScripts.href(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const result: { data?: any; error: any } = await fetchRes.json();
  return result;
}

export async function runScript({ id, scriptArgs }) {
  // TODO: this should also invalidate the "getCurrentUser" query
  // we should figure how to do so using SWR, maybe in the code that calls startSurvey?
  const fetchRes = await fetch(apiRoutes.scripts.runScript.href(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id, scriptArgs }),
  });
  const result: { data?: any; error: any } = await fetchRes.json();
  return result;
}
