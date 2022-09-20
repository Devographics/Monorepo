import { apiRoutes } from "~/lib/apiRoutes";

export const loginAnonymously = async () => {
  return await fetch(apiRoutes.account.anonymousLogin.login.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
