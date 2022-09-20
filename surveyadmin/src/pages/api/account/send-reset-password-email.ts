import { NextApiRequest, NextApiResponse } from "next";
import {
  generateToken,
  hashToken,
  StorableTokenConnector,
} from "~/account/passwordLogin/server";
import { sendResetPasswordEmail } from "~/account/passwordLogin/api/emails";
import { routes } from "~/lib/routes";
import { getRootUrl } from "~/lib/server/utils";
import { UserMongooseModel } from "~/core/models/user.server";
import { apiWrapper } from "~/lib/server/sentry";

interface SendResetPasswordEmailBody {
  email?: string;
}

// Prevent spam
import rateLimit from "express-rate-limit";
import nextConnect from "next-connect";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 request max for a key
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // NOTE: as a default rateLimit will use the IP but this is not totally reliable
  // we can use the requested email here for this precise scenario
  keyGenerator: (request, response) => {
    return (request.body as SendResetPasswordEmailBody).email || "noemail";
  },
});

/**
 * To be called when user has forgot their password
 *
 * Inspired by Blitz "forgotPassword" example and Meteor accounts system
 */

const sendResetPasswordEmailEndpoint = nextConnect<
  NextApiRequest,
  NextApiResponse
>().post(
  limiter,
  connectToAppDbMiddleware,
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { email } = req.body as SendResetPasswordEmailBody;
      // NOTE: it's tempting to validate that the email is actually an email, but can be a bad idea, as
      // surprising emails are valid.
      // Since we use the email only to retrieve the user, we don't need further validation
      if (!email) {
        return res.status(500).send("Please provide a valid email");
      }
      // verify that an user corresponds to this email adress
      const user = await UserMongooseModel.findOne({ email }).exec();
      if (!user) {
        // user not found, wait a little
        // (prevents timings attack to check if an email exists in db)
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Return the same success message as when the user is found, that do not leak
        // information about the existence of this email in the db
        // TODO: however, send a warning to Sentry, so the Technical team can detect and handle those unexpected requests
        console.warn(
          `A password reset request has been sent with email ${email}, but it doesn't exist in our database.`
        );
        return res.status(200).send({ done: true });
      }
      // delete previous requests
      const userId = user._id;
      await StorableTokenConnector.delete({ userId });
      // create the reset url with token
      const token = generateToken();
      const hashedToken = hashToken(token);
      const expiresAt = new Date();
      const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 4;
      expiresAt.setHours(
        expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS
      );
      await StorableTokenConnector.create({
        hashedToken,
        expiresAt: expiresAt.toISOString(),
        userId,
        kind: "resetPassword",
      });
      // TODO: put the app URL here, maybe imported from src/pages/vn/debug/about.tsx but it doesn't seems complete right now
      const resetUrl = `${getRootUrl(req)}${
        routes.account.resetPassword.href
      }/${token}`;

      // send the mail
      await sendResetPasswordEmail({ email, resetUrl });
      // send a 200 status even if there's no user corresponding to the email for better security.
      return res.status(200).send({ done: true });
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  }
);

export default apiWrapper(sendResetPasswordEmailEndpoint);
