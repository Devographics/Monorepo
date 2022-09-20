/**
 * Email will be rendered using React Dom server rendering (renderToStaticMarkup())
 *
 * @see https://reactjs.org/docs/react-dom-server.html
 */
import Mail from "nodemailer/lib/mailer";

// exported only for Storybook, don't use directly this component within your app
export const ResetPasswordTokenEmailHtml = ({
  resetUrl,
}: {
  resetUrl: string;
}) => `
  <div>
    <h1>Reset your password</h1>
    <p>Click on this link to access the password reset interface: ${resetUrl}</p>
    <p>
      You didn't ask for a password reset? Please reach out our Technical Teams.
    </p>
  </div>
`;

export const resetPasswordTokenEmailParameters = ({
  resetUrl,
}): Partial<Mail.Options> => ({
  subject: "Here is your password reset link",
  text: `Click on this link to access the password reset interface: ${resetUrl}. You didn't ask for a password reset? Please reach out our Technical Teams.`,
  html: ResetPasswordTokenEmailHtml({ resetUrl }),
});
