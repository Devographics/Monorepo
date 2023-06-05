import { apiRoutes } from "~/lib/apiRoutes";

export const loginAnonymously = async (options: { data?: any } = {}) => {
  const { data = {} } = options;
  return await fetch(apiRoutes.account.anonymousLogin.login.href(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
