/**
 * Trigger the magic link email
 */

import nextConnect from "next-connect";
import { NextApiRequest, NextApiResponse } from "next";
import { apiWrapper } from "~/lib/server/sentry";

import { magicLinkStrategy } from "~/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";

// check request validity
const checkBody = (req, res, next) => {
  if (!req.body) {
    return res.status(400).send("Request body not defined");
  }
  if (!req.body.destination) {
    return res.status(400).send("No destination email found in request");
  }
  next();
};

// Prevent spam
import rateLimit from "express-rate-limit";
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 request max for a key
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // NOTE: as a default rateLimit will use the IP but this is not totally reliable
  // we can use the requested email here for this precise scenario
  keyGenerator: (request, response) => {
    // request.ip
    return (request.body as MagicLoginSendEmailReqBody).destination;
  },
});

interface MagicLoginSendEmailReqBody {
  destination: string;
}
// NOTE: adding NextApiRequest, NextApiResponse is required to get the right typings in next-connect
// this is the normal behaviour
const login = nextConnect<NextApiRequest, NextApiResponse>().post(
  checkBody,
  limiter,
  connectToAppDbMiddleware,
  magicLinkStrategy.send
);

export default apiWrapper(login);
