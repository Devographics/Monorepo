import { apiRoutes } from "~/lib/apiRoutes";
import { MagicLoginSendEmailBody } from "~/account/magicLogin/typings/requests-body";

export const sendMagicLoginEmail = async (body: MagicLoginSendEmailBody) => {
  const res = await fetch(apiRoutes.account.magicLogin.sendEmail.href(), {
    method: apiRoutes.account.magicLogin.sendEmail.method,
    body: JSON.stringify({ ...body, pathname: window.location.pathname }),
    headers: { "Content-Type": "application/json" },
  });

  return res;
};
