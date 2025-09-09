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
import { fetchEditionMetadata } from "@devographics/fetch";
import { SurveyMetadata, AppName } from "@devographics/types";
import { MagicLoginSendEmailBody } from "../../typings/requests-body";

const orgName = process.env.CONFIG === "tokyodev" ? "TokyoDev" : "Devographics";

const MagicLinkHtml = ({
  magicLink,
  locale,
}: {
  magicLink: string;
  locale?: String;
}) =>
  `<h3>${orgName}</h3>
  <p><a href="${magicLink}">Log in to the survey.</a></p>`;

export const magicLinkEmailParameters = ({
  magicLink,
  locale,
}: {
  magicLink: string;
  locale?: String;
}): Partial<Mail.Options> => {
  return {
    // TODO: customize with current survey?
    subject: `${orgName}: Log in to your account`,
    text: `Click this link to log in to ${orgName} surveys: ${magicLink}.`,
    html: MagicLinkHtml({ magicLink, locale }),
  };
};

export const sendMagicLinkEmail = async ({
  email,
  magicLink,
  surveyId,
  editionId,
  locale,
}: Pick<MagicLoginSendEmailBody, "surveyId" | "editionId" | "locale"> & {
  magicLink: string;
  email: string;
}) => {
  //   let survey;
  //   if (surveyId && editionId) {
  //     const { data: edition } = await fetchEditionMetadata({
  //       surveyId,
  //       editionId,
  //       calledFrom: "sendMagicLinkEmail",
  //     });
  //     survey = edition.survey;
  //   }

  const defaultEmail = `${orgName} <login@mail.devographics.com>`;
  const from = process.env.DEFAULT_MAIL_FROM || defaultEmail;

  /**
   * NOTE: when testing be careful that email will be displayed with addition "=" on line ends!!!
   *  We log a cleaner version of the link
   *
   */
  if (process.env.NODE_ENV === "development") {
    console.info("MAGIC LINK:", magicLink);
  }

  const emailObject = {
    from,
    to: email,
    ...magicLinkEmailParameters({ magicLink, locale }),
  };

  //const magicLink = makeMagicLink(token);
  const res = await localMailTransport.sendMail(emailObject);
};
