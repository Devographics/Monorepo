/**
 * Trigger the magic link email
 */

import nextConnect from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";

import { magicLinkStrategy } from "~/lib/account/magicLogin/api/passport/magic-login-strategy";
import { connectToAppDbMiddleware } from "~/lib/server/middlewares/mongoAppConnection";

// check request validity
const checkBody = (req: NextApiRequest, res: NextApiResponse, next) => {
  if (!req.body) {
    return res.status(400).send("Request body not defined");
  }
  if (!req.body.destination) {
    return res.status(400).send("No destination email found in request");
  }
  next();
};

// TODO: we already have a rate limiter in place for the IP address in middleware.ts
// but I keep this one around until we migrate to route handlers
// remove when migrating (and add an e2e test for rate limiting like we used to do)
import rateLimit from "express-rate-limit";
import { connectToRedisMiddleware } from "~/lib/server/redis";
import { MagicLoginSendEmailBody } from "~/lib/account/magicLogin/typings/requests-body";
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 request max for a key
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // NOTE: as a default rateLimit will use the IP but this is not totally reliable
  // we can use the requested email here for this precise scenario
  keyGenerator: (request, response) => {
    // request.ip
    return ((request as any).body as MagicLoginSendEmailBody).destination;
  },
});

// NOTE: adding NextApiRequest, NextApiResponse is required to get the right typings in next-connect
// this is the normal behaviour
// TODO: get rid of nextConnect if possible
// @ts-ignore
const login = nextConnect<NextApiRequest, NextApiResponse>().post(
  checkBody,
  limiter,
  connectToAppDbMiddleware,
  connectToRedisMiddleware,
  magicLinkStrategy.send
);

export default login;
