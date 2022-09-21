/**
 * Email will be rendered using React Dom server rendering (renderToStaticMarkup())
 *
 * @see https://reactjs.org/docs/react-dom-server.html
 */
import Mail from "nodemailer/lib/mailer";

// exported only for Storybook, don't use directly this component within your app, use the function below
export const ResetPasswordSuccessEmailHtml = () => `
  <div>
    <h1>Reset password success</h1>
    <p>Your password has been reset successfully.</p>
    <p>
      You didn't ask for a password reset? Please reach out our Technical Teams.
    </p>
  </div>
`;

export const resetPasswordSuccessEmailParameters =
  (): Partial<Mail.Options> => ({
    subject: "Password successfully reset",
    text: `Everything went fine. You didn't ask for a password reset? Please reach out our Technical Teams.`,
    html: ResetPasswordSuccessEmailHtml(),
  });
