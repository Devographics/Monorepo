/**
 * Endpoint for when user wants to send the verification email again,
 * eg when user suspect that it's lost
 *
 * You don't need to call it after signup, as signup will already trigger a
 * first email
 */
import { NextApiRequest, NextApiResponse } from "next";


// TODO: factor the context creation so we can reuse it for graphql and REST endpoints
import {
  StorableTokenConnector,
  generateToken,
  hashToken,
} from "~/account/passwordLogin/server";
import { UserMongooseModel } from "~/core/models/user.server";

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
    return request.body.email || "noemail";
  },
});
const sendVerificationEmail = nextConnect<
  NextApiRequest,
  NextApiResponse
>().post(
  limiter,
  connectToAppDbMiddleware,
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const email: string = req.body?.email;
      if (!email) {
        res.status(500).end("email not found");
      }

      // verify that an user corresponds to this email adress
      const user = await UserMongooseModel.findOne({ email }).exec();
      if (!user) {
        return res
          .status(500)
          .send(`user not found: no user correspond to the adress ${email}`);
      }

      // create the url
      const token = generateToken();
      const hashedToken = hashToken(token);
      const expiresAt = new Date();
      const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 4;
      expiresAt.setHours(
        expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS
      );

      const userId = user._id;
      await StorableTokenConnector.create({
        hashedToken,
        expiresAt: expiresAt.toISOString(),
        userId,
      });

      // TODO: put the app URL here, maybe imported from src/pages/vn/debug/about.tsx but it doesn't seems complete right now
      const url = `rootUrl/verify-email/${token}`;

      // send the mail
      console.log(`MAIL: verify email ${email} with the url ${url}`); //TODO: send the real email
      res.status(200).send({ done: true });
    } catch (error) {
      console.error(error);
      res.status(500).end(error.message);
    }
  }
);

export default sendVerificationEmail;
