/**
 * Email will be rendered using React Dom server rendering (renderToStaticMarkup())
 *
 * @see https://reactjs.org/docs/react-dom-server.html
 */
import Mail from "nodemailer/lib/mailer";

// exported only for Storybook, don't use directly this component within your app
// If you update this component, don't forget to also update the text version below
export const VerifyEmailEmailHtml = ({
  verificationUrl,
}: {
  verificationUrl: string;
}) => `
  <div>
    <h1>Email verification</h1>
    <p>
      Click on this link to confirm that you own this email address:
      ${verificationUrl}
    </p>
    <p>
      You didn't sign up to our service? Please reach out our Technical Teams.
    </p>
  </div>
`;

export const verifyEmailEmailParameters = ({
  verificationUrl,
}): Partial<Mail.Options> => ({
  subject: "Email verification",
  text: `
    Click on this link to confirm that you own this email address:
    ${verificationUrl}. You didn't sign up to our service? Please reach out our Technical Teams.`,
  html: VerifyEmailEmailHtml({ verificationUrl }),
});
