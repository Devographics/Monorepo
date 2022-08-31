// TODO: not needed anymore?

// NOTE: kept separated from other part of the code, as it requires TSX
// for the email templates (would break seed script)
import { localMailTransport } from "~/lib/server/mail/transports";
import { resetPasswordTokenEmailParameters } from "./resetPasswordToken";
import { verifyEmailEmailParameters } from "./verifyEmail";
import { resetPasswordSuccessEmailParameters } from "./resetPasswordSuccess";
import { changePasswordSuccessEmailParameters } from "./changePasswordSuccess";

export const sendResetPasswordEmail = async ({ email, resetUrl }) => {
  const res = await localMailTransport.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    ...resetPasswordTokenEmailParameters({ resetUrl }),
  });
  logMail(res);
};

export const sendVerificationEmail = async ({ email, verificationUrl }) => {
  const res = await localMailTransport.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    ...verifyEmailEmailParameters({ verificationUrl }),
  });
  logMail(res);
};

export const sendResetPasswordSuccessEmail = async ({ email }) => {
  const res = await localMailTransport.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    ...resetPasswordSuccessEmailParameters(),
  });
  logMail(res);
};

export const sendChangePasswordSuccessEmail = async ({ email }) => {
  const res = await localMailTransport.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    ...changePasswordSuccessEmailParameters(),
  });
  logMail(res);
};

/**
 * For debug purposes
 * @param res
 */
const logMail = (res) => {
  console.info(
    "Sent an email",
    JSON.stringify(res?.envelope, null, 2),
    (res as any)?.message?.toString()
  );
};
