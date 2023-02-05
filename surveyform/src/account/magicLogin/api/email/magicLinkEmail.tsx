/**
 * Mail for the magic link strategy
 */

import { localMailTransport } from "~/lib/server/mail/transports";

/**
 * Email will be rendered using React Dom server rendering (renderToStaticMarkup())
 *
 * @see https://reactjs.org/docs/react-dom-server.html
 */
import Mail from "nodemailer/lib/mailer";
import { fetchSurveyContext } from "@devographics/core-models/server";
import { SurveySharedContext } from "@devographics/core-models";

const MagicLinkHtml = ({
  magicLink,
  survey,
  locale,
}: {
  magicLink: string;
  survey?: SurveySharedContext;
  locale?: String;
}) =>
  `<h3>${survey?.name}</h3>
  <p><a href="${magicLink}">Log in to the survey.</a></p>`;

export const magicLinkEmailParameters = ({
  magicLink,
  survey,
  locale,
}: {
  magicLink: string;
  survey?: SurveySharedContext;
  locale?: String;
}): Partial<Mail.Options> => {
  return {
    // TODO: customize with current survey?
    subject: `${survey?.name}: Log in to your account`,
    text: `Click this link to log in to the ${survey?.name} survey: ${magicLink}.`,
    html: MagicLinkHtml({ magicLink, survey, locale }),
  };
};

const defaultSlug = "state-of-js";

export const sendMagicLinkEmail = async ({
  email,
  magicLink,
  prettySlug = defaultSlug,
  locale,
}: //token,
{
  email: string;
  magicLink: string;
  prettySlug: string;
  locale: string;
  //token: string;
}) => {
  const slug = prettySlug.replace(/-/g, "_");
  const survey = await fetchSurveyContext(slug);
  const from =
    survey && survey.domain && `${survey.name} <login@mail.${survey.domain}>`;

  /** NOTE: when testing be careful that email will be displayed with addition "=" on line ends!!!
   *  We log a cleaner version of the link
   *
   */
  if (process.env.NODE_ENV === "development") {
    console.info("MAGIC LINK:", magicLink);
  }

  const emailObject = {
    from,
    to: email,
    ...magicLinkEmailParameters({ magicLink, survey, locale }),
  };

  //const magicLink = makeMagicLink(token);
  const res = await localMailTransport.sendMail(emailObject);
};
