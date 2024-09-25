import { apiRoutes } from "~/lib/apiRoutes";

export const loginAnonymously = async (
  options: { data?: any; createResponse?: boolean } = {}
) => {
  const { data = {}, createResponse = false } = options;
  const route = createResponse
    ? apiRoutes.account.anonymousLogin.loginAndCreateResponse.href()
    : apiRoutes.account.anonymousLogin.login.href();
  const fetchRes = await fetch(route, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  // TODO: make error handling more consistent throughout app and then
  // just return JSON here
  // const result = await fetchRes.json();
  return fetchRes;
};
