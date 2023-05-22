import { apiRoutes } from "~/lib/apiRoutes";

type SendEmailBody = {
  /** User's email, used to send the login emai */
  destination: string;
  /** We can create an unverified account as soon as we send the email */
  anonymousId?: string;
  editionId: string;
  surveyId: string;
  locale: string;
};

export const sendMagicLoginEmail = async (body: SendEmailBody) => {
  const res = await fetch(apiRoutes.account.magicLogin.sendEmail.href(), {
    method: apiRoutes.account.magicLogin.sendEmail.method,
    body: JSON.stringify({ ...body, pathname: window.location.pathname }),
    headers: { "Content-Type": "application/json" },
  });

  return res;
};
