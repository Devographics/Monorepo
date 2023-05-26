import { apiRoutes } from "~/lib/apiRoutes";
import { MagicLoginSendEmailBody } from "~/account/magicLogin/typings/requests-body";

export const sendMagicLoginEmail = async (body: MagicLoginSendEmailBody,
  /** 
   * Where to redirect after a successful login
   * "/survey/foobar"
   */
  successRedirectionPath?: string) => {
  const res = await fetch(apiRoutes.account.magicLogin.sendEmail.href({ from: successRedirectionPath }), {
    method: apiRoutes.account.magicLogin.sendEmail.method,
    body: JSON.stringify({ ...body, pathname: window.location.pathname }),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
  });

  return res;
};
