import { apiRoutes } from "~/lib/apiRoutes";
import { MagicLoginSendEmailBody } from "~/account/magicLogin/typings/requests-body";

export const sendMagicLoginEmail = async ({
  body,
}: {
  body: MagicLoginSendEmailBody;
}) => {
  const res = await fetch(apiRoutes.account.magicLogin.sendEmail.href(), {
    method: "POST",
    body: JSON.stringify({
      ...body,
      pathname: window.location.pathname,
    }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  return res;
};
