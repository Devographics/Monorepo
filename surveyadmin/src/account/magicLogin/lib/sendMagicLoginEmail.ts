import { apiRoutes } from "~/lib/apiRoutes";

export const sendMagicLoginEmail = async (
  /** Destination field is mandatory, but you can add any other optional user info  as well */
  body: {
    /** User's email, used to send the login emai */
    destination: string;
    /** We can create an unverified account as soon as we send the email */
    anonymousId?: string;
    prettySlug?: string;
    locale?: string;
  } & any
) => {
  const sendEmailApiRoute = new URL(
    `${window.location.origin}${apiRoutes.account.magicLogin.sendEmail.href}`
  );
  // remember current page
  sendEmailApiRoute.searchParams.set("from", window.location.pathname);
  const res = await fetch(sendEmailApiRoute.toString(), {
    method: apiRoutes.account.magicLogin.sendEmail.method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return res;
};
