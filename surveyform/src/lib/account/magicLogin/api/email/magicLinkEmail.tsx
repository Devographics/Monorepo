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

const MagicLinkHtml = ({
  magicLink,
  survey,
  locale,
}: {
  magicLink: string;
  survey?: SurveyMetadata;
  locale?: String;
}) =>
  `<h3>Devographics</h3>
  <p><a href="${magicLink}">Log in to the survey.</a></p>`;

export const magicLinkEmailParameters = ({
  magicLink,
  survey,
  locale,
}: {
  magicLink: string;
  survey?: SurveyMetadata;
  locale?: String;
}): Partial<Mail.Options> => {
  return {
    // TODO: customize with current survey?
    subject: `Devographics: Log in to your account`,
    text: `Click this link to log in to Devographics surveys: ${magicLink}.`,
    html: MagicLinkHtml({ magicLink, survey, locale }),
  };
};

const defaultSurveyId = "state_of_js";
// TODO: should not be needed we only need the surveyId actually
const defaultEditionId = "js2022";
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
  /**
   * We use state of js as the default context when user is connecting from the generic form
   */
  const { data: edition } = await fetchEditionMetadata({
    surveyId: surveyId || defaultSurveyId,
    editionId: editionId || defaultEditionId,
    calledFrom: "sendMagicLinkEmail",
  });
  const survey = edition.survey;

  const defaultEmail =
    survey.domain && `${survey.name} <login@mail.devographics.com>`;
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
    ...magicLinkEmailParameters({ magicLink, survey, locale }),
  };

  //const magicLink = makeMagicLink(token);
  const res = await localMailTransport.sendMail(emailObject);
};
